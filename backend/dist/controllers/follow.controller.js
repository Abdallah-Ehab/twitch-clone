import { follow, unfollow } from '../services/follow.service.js';
import User from '../models/user.model.js';
export const followChannel = async (req, res) => {
    try {
        const userIdStr = req.user.id;
        const user = await User.findOne({ id: userIdStr });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const followerId = user._id;
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
        const userIdStr = req.user.id;
        const user = await User.findOne({ id: userIdStr });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const followerId = user._id;
        const { channelId } = req.params;
        const removed = await unfollow(followerId, channelId);
        res.status(200).json(removed);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//# sourceMappingURL=follow.controller.js.map