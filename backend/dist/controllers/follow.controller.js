import { follow, unfollow } from '../services/follow.service.js';
export const followChannel = async (req, res) => {
    try {
        const followerId = req.user.id;
        const { channelId } = req.params;
        const newFollow = await follow(followerId, channelId);
        res.status(201).json(newFollow);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const unfollowChannel = async (req, res) => {
    try {
        const followerId = req.user.id;
        const { channelId } = req.params;
        const removed = await unfollow(followerId, channelId);
        res.status(200).json(removed);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//# sourceMappingURL=follow.controller.js.map