import { Request, Response } from 'express';
import { getAll, getByUsername, getById, getByUserId, update } from '../services/channel.service.js';

export const getChannels = async (req: Request, res: Response) => {
    try {
        const channels = await getAll();
        res.status(200).json(channels);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getChannelByUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const channel = await getByUsername(username as string);
        res.status(200).json(channel);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

export const getMyChannel = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const channel = await getByUserId(userId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        
        res.status(200).json(channel);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateChannel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const userIdStr = (req as any).user.id;
        const channel = await getById(id as string);
        
        if (!channel.owner || (channel.owner as any)._id.toString() !== userIdStr) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const updated = await update(id as string, req.body);
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
