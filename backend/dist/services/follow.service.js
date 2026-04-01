import Follow from '../models/follow.model.js';
export const follow = async (followerId, channelId) => {
    const existingFollow = await Follow.findOne({ follower: followerId, channel: channelId });
    if (existingFollow) {
        throw new Error('Already following');
    }
    const newFollow = new Follow({ follower: followerId, channel: channelId });
    await newFollow.save();
    return newFollow;
};
export const unfollow = async (followerId, channelId) => {
    const deleted = await Follow.findOneAndDelete({ follower: followerId, channel: channelId });
    if (!deleted) {
        throw new Error('Follow not found');
    }
    return deleted;
};
export const isFollowing = async (followerId, channelId) => {
    const follow = await Follow.findOne({ follower: followerId, channel: channelId });
    return !!follow;
};
export const getFollowers = async (channelId) => {
    return await Follow.find({ channel: channelId }).populate('follower', 'username id').exec();
};
export const getFollowing = async (followerId) => {
    return await Follow.find({ follower: followerId }).populate('channel').exec();
};
//# sourceMappingURL=follow.service.js.map