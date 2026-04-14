import Channel from '../models/channel.model.js';
import User from '../models/user.model.js';
const RTMP_URL = process.env.RTMP_URL || 'rtmp://localhost:1935';
const HLS_URL = process.env.HLS_URL || 'http://localhost:8000';
export const getAll = async (options = {}) => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 12));
    const skip = (page - 1) * limit;
    const liveOnly = options.liveOnly !== false;
    const query = liveOnly ? { isLive: true } : {};
    const [channels, total] = await Promise.all([
        Channel.find(query)
            .populate('owner', 'username avatarUrl')
            .sort({ isLive: -1, viewerCount: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        Channel.countDocuments(query)
    ]);
    return {
        channels: channels.map(channel => ({
            id: channel._id.toString(),
            username: channel.owner.username,
            avatarUrl: channel.owner.avatarUrl || '',
            thumbnailUrl: channel.bannerUrl || '',
            bannerUrl: channel.bannerUrl || '',
            bio: channel.bio || '',
            isLive: channel.isLive,
            viewerCount: channel.viewerCount,
            streamUrl: `${RTMP_URL}/live/${channel.streamKey}`,
            hlsUrl: `${HLS_URL}/live/${channel.streamKey}/index.m3u8`,
            qualities: ['auto', '1080p', '720p', '480p', '360p']
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
    };
};
export const getAllWithUserInfo = async () => {
    const channels = await Channel.find()
        .populate('owner', 'username avatarUrl')
        .sort({ viewerCount: -1 })
        .exec();
    return channels.map(channel => ({
        id: channel._id.toString(),
        username: channel.owner.username,
        avatarUrl: channel.owner.avatarUrl || '',
        thumbnailUrl: channel.bannerUrl || '',
        bannerUrl: channel.bannerUrl || '',
        bio: channel.bio || '',
        isLive: channel.isLive,
        viewerCount: channel.viewerCount,
        streamUrl: `${RTMP_URL}/live/${channel.streamKey}`,
        hlsUrl: `${HLS_URL}/live/${channel.streamKey}/index.m3u8`,
        qualities: ['auto', '1080p', '720p', '480p', '360p']
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
        id: channel._id.toString(),
        username: channel.owner.username,
        avatarUrl: channel.owner.avatarUrl || '',
        thumbnailUrl: channel.bannerUrl || '',
        bannerUrl: channel.bannerUrl || '',
        bio: channel.bio || '',
        isLive: channel.isLive,
        viewerCount: channel.viewerCount,
        streamUrl: `${RTMP_URL}/live/${channel.streamKey}`,
        hlsUrl: `${HLS_URL}/live/${channel.streamKey}/index.m3u8`,
        qualities: ['auto', '1080p', '720p', '480p', '360p']
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
export const getByUserId = async (userId) => {
    const channel = await Channel.findOne({ owner: userId })
        .populate('owner', 'username avatarUrl')
        .exec();
    if (!channel) {
        return null;
    }
    return {
        id: channel._id.toString(),
        username: channel.owner.username,
        avatarUrl: channel.owner.avatarUrl || '',
        thumbnailUrl: channel.bannerUrl || '',
        bannerUrl: channel.bannerUrl || '',
        bio: channel.bio || '',
        isLive: channel.isLive,
        viewerCount: channel.viewerCount,
        streamUrl: `${RTMP_URL}/live/${channel.streamKey}`,
        hlsUrl: `${HLS_URL}/live/${channel.streamKey}/index.m3u8`,
        qualities: ['auto', '1080p', '720p', '480p', '360p']
    };
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