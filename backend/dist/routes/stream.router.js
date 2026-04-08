import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { socketService } from '../services/socket.service.js';
import Channel from '../models/channel.model.js';
import Stream from '../models/stream.model.js';
const router = Router();
router.post('/start', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const channel = await Channel.findOne({ owner: userId });
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        const stream = await socketService.startStream(channel._id.toString());
        res.json({
            success: true,
            stream: {
                id: stream._id,
                channelId: channel._id,
                isLive: true,
                startedAt: stream.startedAt
            }
        });
    }
    catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({ error: 'Failed to start stream' });
    }
});
router.post('/end', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const channel = await Channel.findOne({ owner: userId });
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        await socketService.endStream(channel._id.toString());
        res.json({ success: true, message: 'Stream ended' });
    }
    catch (error) {
        console.error('Error ending stream:', error);
        res.status(500).json({ error: 'Failed to end stream' });
    }
});
router.get('/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;
        const stream = await Stream.findOne({ channel: channelId });
        if (!stream) {
            return res.json({
                isLive: false,
                recentMessages: []
            });
        }
        res.json({
            isLive: stream.isLive,
            startedAt: stream.startedAt,
            endedAt: stream.endedAt,
            recentMessages: stream.recentMessages
        });
    }
    catch (error) {
        console.error('Error getting stream:', error);
        res.status(500).json({ error: 'Failed to get stream' });
    }
});
export default router;
//# sourceMappingURL=stream.router.js.map