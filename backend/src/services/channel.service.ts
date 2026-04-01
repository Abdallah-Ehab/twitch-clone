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
}

export const getAll = async (): Promise<ChannelResponse[]> => {
    const channels = await Channel.find({ isLive: true })
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
        hlsUrl: `${HLS_URL}/live/${channel.streamKey}/stream.m3u8`,
        qualities: ['auto', '1080p', '720p', '480p', '360p']
    }));
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
        hlsUrl: `${HLS_URL}/live/${channel.streamKey}/stream.m3u8`,
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
        hlsUrl: `${HLS_URL}/live/${channel.streamKey}/stream.m3u8`,
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
        hlsUrl: `${HLS_URL}/live/${channel.streamKey}/stream.m3u8`,
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
