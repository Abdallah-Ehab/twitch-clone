import userModel from "../models/user.model.js";
import bcrypt from 'bcrypt';


export const register = async (userData: { username: string; email: string; password: string }) => {
    const { username, email, password } = userData;


    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new Error('Email is already registered');
    }


    const newUser = new userModel({
        id: new Date().getTime().toString(),
        username,
        email,
        password,
        streamkey: generateStreamKey()
    });
    await newUser.save();
}

function generateStreamKey() {
    return Math.random().toString(36).substr(2, 15);
}

export const login = async (email: string, password: string) => {
    const user = await userModel.findOne({email});
    if (!user) {
        throw new Error('Invalid email or password');
    }


    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    return user;
}


