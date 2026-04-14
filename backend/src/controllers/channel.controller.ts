import { Request, Response } from 'express';
import { getAll, getByUsername, getById, getByUserId, update, getCategories } from '../services/channel.service.js';

export const getChannels = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const liveOnly = req.query.liveOnly !== 'false';
        const search = req.query.search as string | undefined;
        const category = req.query.category as string | undefined;
        const sortBy = req.query.sortBy as 'viewers' | 'recent' | 'alphabetical' | undefined;

        const result = await getAll({ page, limit, liveOnly, search, category, sortBy });
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await getCategories();
        res.status(200).json(categories);
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
