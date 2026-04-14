import Channel from '../models/channel.model.js';
import User, { IUser } from '../models/user.model.js';

const RTMP_URL = process.env.RTMP_URL || 'rtmp://localhost:1935';
const HLS_URL = process.env.HLS_URL || 'http://localhost:8000';

export interface ChannelResponse {
    id: string;
    username: string;
    avatarUrl: string;
    thumbnailUrl: string;
    bannerUrl: string;
    bio: string;
    isLive: boolean;
    viewerCount: number;
    streamUrl: string;
    hlsUrl: string;
    qualities: string[];
    category: string;
}

export interface PaginatedChannels {
    channels: ChannelResponse[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}

export interface ChannelFilters {
    page?: number;
    limit?: number;
    liveOnly?: boolean;
    search?: string;
    category?: string;
    sortBy?: 'viewers' | 'recent' | 'alphabetical';
}

export const getAll = async (options: ChannelFilters = {}): Promise<PaginatedChannels> => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 12));
    const skip = (page - 1) * limit;
    const liveOnly = options.liveOnly !== false;

    let query: any = {};

    if (liveOnly) {
        query.isLive = true;
    }

    if (options.category) {
        query.category = options.category;
    }

    if (options.search) {
        const searchRegex = new RegExp(options.search, 'i');
        const users = await User.find({
            $or: [
                { username: searchRegex },
                { email: searchRegex }
            ]
        }).select('_id');

        query.$or = [
            { owner: { $in: users.map(u => u._id) } },
            { bio: searchRegex }
        ];
    }

    let sort: any = { isLive: -1 };
    switch (options.sortBy) {
        case 'viewers':
            sort = { isLive: -1, viewerCount: -1 };
            break;
        case 'recent':
            sort = { createdAt: -1 };
            if (liveOnly) sort.isLive = -1;
            break;
        case 'alphabetical':
            sort = { isLive: -1 };
            break;
        default:
            sort = { isLive: -1, viewerCount: -1 };
    }

    const [channels, total] = await Promise.all([
        Channel.find(query)
            .populate<{ owner: IUser }>('owner', 'username avatarUrl')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(),
        Channel.countDocuments(query)
    ]);

    let sortedChannels = channels;
    if (options.sortBy === 'alphabetical') {
        sortedChannels = [...channels].sort((a, b) =>
            a.owner.username.localeCompare(b.owner.username)
        );
    }

    return {
        channels: sortedChannels.map(channel => ({
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
            qualities: ['auto', '1080p', '720p', '480p', '360p'],
            category: channel.category || 'Variety'
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
    };
};

export const getCategories = async (): Promise<string[]> => {
    const categories = await Channel.distinct('category');
    return categories.sort();
};

export const getAllWithUserInfo = async (): Promise<ChannelResponse[]> => {
    const channels = await Channel.find()
        .populate<{ owner: IUser }>('owner', 'username avatarUrl')
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

export const getByUsername = async (username: string): Promise<ChannelResponse> => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('User not found');
    }
    const channel = await Channel.findOne({ owner: user._id })
        .populate<{ owner: IUser }>('owner', 'username avatarUrl')
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

export const getById = async (id: string) => {
    const channel = await Channel.findById(id)
        .populate<{ owner: IUser }>('owner', 'username avatarUrl')
        .exec();
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
};

export const getByUserId = async (userId: string): Promise<ChannelResponse | null> => {
    const channel = await Channel.findOne({ owner: userId })
        .populate<{ owner: IUser }>('owner', 'username avatarUrl')
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

export const update = async (id: string, updateData: Partial<{ bio: string; avatarUrl: string; bannerUrl: string; isLive: boolean; viewerCount: number }>) => {
    const channel = await Channel.findByIdAndUpdate(id, updateData, { new: true })
        .populate<{ owner: IUser }>('owner', 'username avatarUrl')
        .exec();
    if (!channel) {
        throw new Error('Channel not found');
    }
    return channel;
};
