import NodeMediaServer from 'node-media-server';
import userModel from '../models/user.model.js';
const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 8000,
        allow_origin: '*'
    },
    relay: {
        ffmpeg: '/usr/local/bin/ffmpeg',
        tasks: [
            {
                app: 'live',
                mode: 'push',
                edge: 'rtmp://localhost:1936',
            },
            {
                app: 'live',
                mode: 'push',
                edge: 'rtmp://localhost:1937',
            }
        ]
    }
};
var nms = new NodeMediaServer(config);
nms.run();
nms.on('prePublish', async (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    const streamKey = StreamPath.split('/').pop();
    const session = nms.getSession(id);
    try {
        const user = await userModel.findOne({ streamkey: streamKey });
        if (!user) {
            console.log('User not found. Rejecting stream.');
            session?.reject();
        }
        else {
            user.updateOne({ isStreaming: true }).exec();
            console.log(`Stream accepted for user: ${user.username}`);
        }
    }
    catch (err) {
        const session = nms.getSession(id);
        session?.reject();
        console.error('Error occurred while fetching user:', err);
    }
});
nms.on('donePublish', async (id, StreamPath, args) => {
    console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    const streamKey = StreamPath.split('/').pop();
    try {
        const user = await userModel.findOne({ streamkey: streamKey });
        if (user) {
            user.updateOne({ isStreaming: false }).exec();
            console.log(`Stream ended for user: ${user.username}`);
        }
        else {
            console.log('User not found for ended stream.');
        }
    }
    catch (err) {
        console.error('Error occurred while fetching user:', err);
    }
});
//# sourceMappingURL=node_media_server.js.map