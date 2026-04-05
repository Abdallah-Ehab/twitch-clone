import { getAll, getByUsername, getById, getByUserId, update } from '../services/channel.service.js';
export const getChannels = async (req, res) => {
    try {
        const channels = await getAll();
        res.status(200).json(channels);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getChannelByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const channel = await getByUsername(username);
        res.status(200).json(channel);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
export const getMyChannel = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const channel = await getByUserId(userId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        res.status(200).json(channel);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdStr = req.user.id;
        const channel = await getById(id);
        if (!channel.owner || channel.owner._id.toString() !== userIdStr) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updated = await update(id, req.body);
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//# sourceMappingURL=channel.controller.js.map