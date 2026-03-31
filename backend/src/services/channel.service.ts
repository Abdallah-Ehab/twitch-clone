import Channel from '../models/channel.model.js';
import User from '../models/user.model.js';
import { Types } from 'mongoose';

export const getAll = async () => {
    return await Channel.find().populate('owner', 'username id').exec();
};

export const getByUsername = async (username: string) => {
    const user = await User.findOne({ username }).select('_id id username');
    if (!user) {
        throw new Error('User not found');
    }
    const channel = await Channel.findOne({ owner: user._id }).populate('owner', 'username id').exec();
    return channel;
};

export const getById = async (id: string | Types.ObjectId) => {
    const channel = await Channel.findById(id).populate('owner', 'username id').exec();
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
};

export const update = async (id: string | Types.ObjectId, updateData: Partial<{ bio: string; avatarUrl: string; bannerUrl: string }>) => {
    const channel = await Channel.findByIdAndUpdate(id, updateData, { new: true }).populate('owner', 'username id').exec();
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
};