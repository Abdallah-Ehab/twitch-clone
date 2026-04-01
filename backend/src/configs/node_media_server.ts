import NodeMediaServer from 'node-media-server';
import Channel from '../models/channel.model.js';
import mongoose from 'mongoose';

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
    mediaroot: './media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=10:hls_flags=delete_segments]',
        tasks: [
          {
            mod: 'libx264',
            name: '1080p',
            videoBitrate: '2500k',
            audioBitrate: '128k',
            resolution: '1920x1080',
            fps: 30
          },
          {
            mod: 'libx264',
            name: '720p',
            videoBitrate: '1500k',
            audioBitrate: '128k',
            resolution: '1280x720',
            fps: 30
          },
          {
            mod: 'libx264',
            name: '480p',
            videoBitrate: '800k',
            audioBitrate: '96k',
            resolution: '854x480',
            fps: 30
          },
          {
            mod: 'libx264',
            name: '360p',
            videoBitrate: '400k',
            audioBitrate: '96k',
            resolution: '640x360',
            fps: 30
          }
        ]
      }
    ]
  }
};

class StreamManager {
  private nms: any;
  private activeStreams: Map<string, { startTime: Date; viewerCount: number }> = new Map();

  start() {
    try {
      this.nms = new NodeMediaServer(config as any);
      this.nms.run();
      this.setupEventHandlers();
      console.log(`[StreamManager] NodeMediaServer started on RTMP:${RTMP_PORT}, HTTP:${HLS_PORT}`);
    } catch (error) {
      console.error('[StreamManager] Failed to start:', error);
    }
  }

  private setupEventHandlers() {

    this.nms.on('prePublish', async (id: string, streamPath: string, args: any) => {
      console.log('[NodeEvent prePublish]', `id=${id} streamPath=${streamPath}`);

      const streamKey = streamPath.split('/').pop();
      if (!streamKey) {
        console.log('No stream key found, rejecting');
        const session = this.nms.getSession(id);
        session?.reject();
        return;
      }

      try {
        const channel = await Channel.findOne({ streamKey }).populate('owner');

        if (!channel) {
          console.log(`Stream key not found: ${streamKey}, rejecting stream`);
          const session = this.nms.getSession(id);
          session?.reject();
          return;
        }

        await Channel.findByIdAndUpdate(channel._id, { isLive: true, viewerCount: 0 });

        this.activeStreams.set(streamKey, {
          startTime: new Date(),
          viewerCount: 0
        });

        const ownerName = (channel.owner as any)?.username || 'Unknown';
        console.log(`[StreamManager] Stream started: ${ownerName} (${streamKey})`);
      } catch (err) {
        console.error('[StreamManager] Error in prePublish:', err);
        const session = this.nms.getSession(id);
        session?.reject();
      }
    });

    this.nms.on('donePublish', async (id: string, streamPath: string, args: any) => {
      console.log('[NodeEvent donePublish]', `id=${id} streamPath=${streamPath}`);

      const streamKey = streamPath.split('/').pop();
      if (!streamKey) return;

      try {
        const channel = await Channel.findOne({ streamKey }).populate('owner');

        if (channel) {
          await Channel.findByIdAndUpdate(channel._id, { isLive: false, viewerCount: 0 });
          const ownerName = (channel.owner as any)?.username || 'Unknown';
          console.log(`[StreamManager] Stream ended: ${ownerName}`);
        }

        this.activeStreams.delete(streamKey);
      } catch (err) {
        console.error('[StreamManager] Error in donePublish:', err);
      }
    });

    this.nms.on('prePlay', (id: string, streamPath: string, args: any) => {
      console.log('[NodeEvent prePlay]', `id=${id} streamPath=${streamPath}`);
    });

    this.nms.on('postPlay', (id: string, streamPath: string, args: any) => {
      console.log('[NodeEvent postPlay]', `id=${id} streamPath=${streamPath}`);
      const streamKey = streamPath.replace('/live/', '').replace('/stream.m3u8', '');
      const stream = this.activeStreams.get(streamKey);
      if (stream) {
        stream.viewerCount++;
        this.updateViewerCount(streamKey);
      }
    });

    this.nms.on('donePlay', (id: string, streamPath: string, args: any) => {
      console.log('[NodeEvent donePlay]', `id=${id} streamPath=${streamPath}`);
      const streamKey = streamPath.replace('/live/', '').replace('/stream.m3u8', '');
      const stream = this.activeStreams.get(streamKey);
      if (stream && stream.viewerCount > 0) {
        stream.viewerCount--;
        this.updateViewerCount(streamKey);
      }
    });
  }

  private async updateViewerCount(streamKey: string) {
    try {
      const stream = this.activeStreams.get(streamKey);
      if (stream) {
        const channel = await Channel.findOne({ streamKey });
        if (channel) {
          await Channel.findByIdAndUpdate(channel._id, { viewerCount: Math.max(0, stream.viewerCount) });
        }
      }
    } catch (err) {
      console.error('[StreamManager] Error updating viewer count:', err);
    }
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
