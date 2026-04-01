import Channel from '../models/channel.model.js';
import User from '../models/user.model.js';
export const getAll = async () => {
    const channels = await Channel.find({ isLive: true })
        .populate('owner', 'username avatarUrl')
        .sort({ viewerCount: -1 })
        .exec();
    return channels.map(channel => ({
        id: channel._id,
        username: channel.owner.username,
        avatarUrl: channel.owner.avatarUrl || '',
        thumbnailUrl: channel.bannerUrl || '',
        bio: channel.bio || '',
        isLive: channel.isLive,
        viewerCount: channel.viewerCount,
        streamKey: channel.streamKey
    }));
};
export const getAllWithUserInfo = async () => {
    const channels = await Channel.find()
        .populate('owner', 'username avatarUrl')
        .sort({ viewerCount: -1 })
        .exec();
    return channels.map(channel => ({
        id: channel._id,
        username: channel.owner.username,
        avatarUrl: channel.owner.avatarUrl || '',
        thumbnailUrl: channel.bannerUrl || '',
        bio: channel.bio || '',
        isLive: channel.isLive,
        viewerCount: channel.viewerCount,
        streamKey: channel.streamKey
    }));
};
export const getByUsername = async (username) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('User not found');
    }
    const channel = await Channel.findOne({ owner: user._id })
        .populate('owner', 'username avatarUrl')
        .exec();
    if (!channel) {
        throw new Error('Channel not found');
    }
    return {
        id: channel._id,
        username: channel.owner.username,
        avatarUrl: channel.owner.avatarUrl || '',
        bannerUrl: channel.bannerUrl || '',
        bio: channel.bio || '',
        isLive: channel.isLive,
        viewerCount: channel.viewerCount,
        streamKey: channel.streamKey
    };
};
export const getById = async (id) => {
    const channel = await Channel.findById(id)
        .populate('owner', 'username avatarUrl')
        .exec();
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
};
export const update = async (id, updateData) => {
    const channel = await Channel.findByIdAndUpdate(id, updateData, { new: true })
        .populate('owner', 'username avatarUrl')
        .exec();
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
};
//# sourceMappingURL=channel.service.js.map