import NodeMediaServer from 'node-media-server';
import Channel from '../models/channel.model.js';
import fs from 'fs';
import path from 'path';

// Fix for node-media-server bug
// https://github.com/illuspas/Node-Media-Server/issues/450
(global as any).version = 'ffmpeg unknown';

const RTMP_PORT = parseInt(process.env.RTMP_PORT || '1935', 10);
const HLS_PORT = parseInt(process.env.HLS_PORT || '8000', 10);

const config = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: HLS_PORT,
    mediaroot: path.resolve('./media'),
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=10:hls_flags=delete_segments]',
        hlskeep: true
      }
    ]
  }
};

class StreamManager {
  private nms: any;
  private activeStreams: Map<string, { startTime: Date; viewerCount: number }> = new Map();

  start() {
    try {
      const mediaPath = path.resolve(config.http.mediaroot);
      if (!fs.existsSync(mediaPath)) {
        fs.mkdirSync(mediaPath, { recursive: true });
        console.log(`[StreamManager] Created media root directory at ${mediaPath}`);
      }

      this.nms = new NodeMediaServer(config as any);
      this.nms.run();
      this.setupEventHandlers();
      console.log(`[StreamManager] NodeMediaServer started on RTMP:${RTMP_PORT}, HTTP:${HLS_PORT}`);
    } catch (error) {
      console.error('[StreamManager] Failed to start:', error);
    }
  }

  private setupEventHandlers() {


    this.nms.on('ffmpegPublish', (stream: any) => {
  console.log('[ffmpeg] process started for stream:', stream.streamPath);
  stream.ffmpegProcess?.stderr?.on('data', (data: any) => {
    console.log('[ffmpeg stderr]', data.toString());
  });
});

    this.nms.on('prePublish', async (session: any, streamPath: string, args: any) => {
      console.log('[NodeEvent prePublish]', `id=${session.id} streamPath=${streamPath}`);
      console.log(session);
      console.log('Stream args:', session.publishArgs);
      // parse the stream args
      const realStreamPath = session?.streamPath || streamPath;
      const realargs = session?.publishArgs || args;

      const streamKey = realStreamPath.split('/').pop();
      if (!streamKey) {
        console.log('No stream key found, rejecting');

        session?.reject();
        return;
      }

      try {
        const channel = await Channel.findOne({ streamKey }).populate('owner');

        if (!channel) {
          console.log(`Stream key not found: ${streamKey}, rejecting stream`);

          session?.reject();
          return;
        }

        await Channel.findByIdAndUpdate(channel._id, { isLive: true, viewerCount: 0 });

        const verify = await Channel.findById(channel._id);
console.log('[StreamManager] DB verify after prePublish:', verify?.isLive);

        this.activeStreams.set(streamKey, {
          startTime: new Date(),
          viewerCount: 0
        });

        const ownerName = (channel.owner as any)?.username || 'Unknown';
        console.log(`[StreamManager] Stream started: ${ownerName} (${streamKey})`);

      } catch (err) {
        console.error('[StreamManager] Error in prePublish:', err);

        session?.reject();
      }
    });

    this.nms.on('donePublish', async (session: any, streamPath: string, args: any) => {
      console.log('[NodeEvent donePublish]', `id=${session?.id || 'unknown'} streamPath=${streamPath}`);

      const realStreamPath = session?.streamPath || streamPath;
      const streamKey = realStreamPath.split('/').pop();
      if (!streamKey) return;

      try {
        const channel = await Channel.findOne({ streamKey }).populate('owner');

        if (channel) {
          await Channel.findByIdAndUpdate(channel._id, { isLive: false, viewerCount: 0 });
          const ownerName = (channel.owner as any)?.username || 'Unknown';
          console.log(`[StreamManager] Stream ended: ${ownerName}`);
          console.log('[StreamManager] DB verify after donePublish:', (await Channel.findById(channel._id))?.isLive);
        }

        this.activeStreams.delete(streamKey);
      } catch (err) {
        console.error('[StreamManager] Error in donePublish:', err);
      }
    });

    this.nms.on('prePlay', (session: any, streamPath: string, args: any) => {
      console.log('[NodeEvent prePlay]', `id=${session?.id || 'unknown'} streamPath=${streamPath}`);
    });

    this.nms.on('postPlay', (session: any, streamPath: string, args: any) => {
      console.log('[NodeEvent postPlay]', `id=${session?.id || 'unknown'} streamPath=${streamPath}`);

      const realStreamPath = session?.streamPath || streamPath;
      const parts = realStreamPath.split('/');
      const streamKey = parts.pop(); // typically the stream key is the last part
      if (!streamKey) return;
      const activeStream = this.activeStreams.get(streamKey);
      if (activeStream) {
        activeStream.viewerCount++;
        this.updateViewerCount(streamKey);
      }
    });

    this.nms.on('donePlay', (session: any, streamPath: string, args: any) => {
      console.log('[NodeEvent donePlay]', `id=${session?.id || 'unknown'} streamPath=${streamPath}`);

      const realStreamPath = session?.streamPath || streamPath;
      const parts = realStreamPath.split('/');
      const streamKey = parts.pop();
      if (!streamKey) return;
      const activeStream = this.activeStreams.get(streamKey);
      if (activeStream && activeStream.viewerCount > 0) {
        activeStream.viewerCount--;
        this.updateViewerCount(streamKey);
      }
    });
  }

  private viewerCountUpdateTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastViewerCounts: Map<string, number> = new Map();

  private async updateViewerCount(streamKey: string) {
    const stream = this.activeStreams.get(streamKey);
    if (!stream) return;

    const lastCount = this.lastViewerCounts.get(streamKey) ?? -1;
    if (stream.viewerCount === lastCount) return;

    if (this.viewerCountUpdateTimers.has(streamKey)) {
      return;
    }

    const timer = setTimeout(async () => {
      this.viewerCountUpdateTimers.delete(streamKey);

      try {
        const currentStream = this.activeStreams.get(streamKey);
        if (!currentStream) return;

        const channel = await Channel.findOne({ streamKey });
        if (channel) {
          const newCount = Math.max(0, currentStream.viewerCount);

          if (newCount !== this.lastViewerCounts.get(streamKey)) {
            this.lastViewerCounts.set(streamKey, newCount);

            await Channel.findByIdAndUpdate(channel._id, { viewerCount: newCount });
          }
        }
      } catch (err) {
        console.error('[StreamManager] Error updating viewer count:', err);
      }
    }, 1000);

    this.viewerCountUpdateTimers.set(streamKey, timer);
  }

  getStreamInfo(streamKey: string) {
    return this.activeStreams.get(streamKey);
  }

  getAllActiveStreams() {
    return Array.from(this.activeStreams.entries()).map(([key, value]) => ({
      streamKey: key,
      ...value
    }));
  }
}

export const streamManager = new StreamManager();
export default streamManager;
