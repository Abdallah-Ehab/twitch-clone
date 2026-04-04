import { Request, Response } from 'express';
import { follow, unfollow } from '../services/follow.service.js';

export const followChannel = async (req: Request, res: Response) => {
    try {
        const followerId = (req as any).user.id;
        const { channelId } = req.params;
        const newFollow = await follow(followerId, channelId as string);
        res.status(201).json(newFollow);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const unfollowChannel = async (req: Request, res: Response) => {
    try {
        const followerId = (req as any).user.id;
        const { channelId } = req.params;
        const removed = await unfollow(followerId, channelId as string);
        res.status(200).json(removed);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
