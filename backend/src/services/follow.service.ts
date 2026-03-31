import Follow from '../models/follow.model.js';
import Channel from '../models/channel.model.js';
import User from '../models/user.model.js';
import { Types } from 'mongoose';

export const follow = async (followerId: string | Types.ObjectId, channelId: string | Types.ObjectId) => {
    const existingFollow = await Follow.findOne({ follower: followerId, channel: channelId });
    if (existingFollow) {
        throw new Error('Already following');
    }
    const newFollow = new Follow({ follower: followerId, channel: channelId });
    await newFollow.save();
    return newFollow;
};

export const unfollow = async (followerId: string | Types.ObjectId, channelId: string | Types.ObjectId) => {
    const deleted = await Follow.findOneAndDelete({ follower: followerId, channel: channelId });
    if (!deleted) {
        throw new Error('Follow not found');
    }
    return deleted;
};

export const isFollowing = async (followerId: string | Types.ObjectId, channelId: string | Types.ObjectId):Promise<boolean> => {
    const follow = await Follow.findOne({ follower: followerId, channel: channelId });
    return !!follow;
};

export const getFollowers = async (channelId: string | Types.ObjectId) => {
    return await Follow.find({ channel: channelId }).populate('follower', 'username id').exec();
};

export const getFollowing = async (followerId: string | Types.ObjectId) => {
    return await Follow.find({ follower: followerId }).populate('channel').exec();
};