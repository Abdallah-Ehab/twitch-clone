import { Request, Response } from 'express';
import { follow, unfollow, isFollowing, getFollowers, getFollowing } from '../services/follow.service.js';
import User from '../models/user.model.js';

export const followChannel = async (req: Request, res: Response) => {
    try {
        const userIdStr = (req as any).user.id;
        const user = await User.findOne({ id: userIdStr });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const followerId = user._id;
        const { channelId } = req.params;
        const newFollow = await follow(followerId, channelId as string);
        res.status(201).json(newFollow);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const unfollowChannel = async (req: Request, res: Response) => {
    try {
        const userIdStr = (req as any).user.id;
        const user = await User.findOne({ id: userIdStr });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const followerId = user._id;
        const { channelId } = req.params;
        const removed = await unfollow(followerId, channelId as string);
        res.status(200).json(removed);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
