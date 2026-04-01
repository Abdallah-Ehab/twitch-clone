import userModel from "../models/user.model.js";
import bcrypt from 'bcrypt';
import Channel from '../models/channel.model.js';
export const register = async (userData) => {
    const { username, email, password } = userData;
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
        throw new Error('Email is already registered');
    }
    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
        throw new Error('Username is already taken');
    }
    const streamKey = generateStreamKey();
    const newUser = new userModel({
        username,
        email,
        password,
        streamkey: streamKey
    });
    const savedUser = await newUser.save();
    const newChannel = new Channel({
        owner: savedUser._id,
        streamKey: streamKey
    });
    await newChannel.save();
    return savedUser;
};
function generateStreamKey() {
    return 'live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
export const login = async (email, password) => {
    const user = await userModel.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    return user;
};
export const getUserById = async (id) => {
    return await userModel.findById(id).select('-password');
};
export const getUserByUsername = async (username) => {
    return await userModel.findOne({ username }).select('-password');
};
//# sourceMappingURL=auth.service.js.map