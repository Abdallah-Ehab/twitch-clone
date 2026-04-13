import {register, login, getUserById} from '../services/auth.service.js';
import { generateToken } from '../utils/tokenGenerator.js';
import RefreshTokenModel from '../models/refreshToken.model.js';
import type { Response, Request } from 'express';


export const registerController = async (req: Request, res: Response) => {
    try {
        await register(req.body);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await login(email, password);
        const userId = (user as any)._id.toString();
        const accessToken = generateToken({ id: userId, email: user.email }, '15m');
        const refreshToken = generateToken({ id: userId, email: user.email }, '7d');

        await RefreshTokenModel.create({ userId, token: refreshToken });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: userId,
                username: user.username,
                email: user.email
            },
            accessToken
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const refreshTokenController = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const savedToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!savedToken) throw new Error('Invalid Session');

        const jwt = await import('jsonwebtoken');
        const user = jwt.default.verify(refreshToken, process.env.JWT_SECRET as string) as any;
        const newAccessToken = generateToken(user, '15m');
        const newRefreshToken = generateToken(user, '7d');

        savedToken.token = newRefreshToken;
        await savedToken.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ error: 'Session expired' });
    }
}

export const logout = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? null;
    if (userId) {
        await RefreshTokenModel.deleteMany({ userId });
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
}


export const isLoggedInController = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? null;
    console.log(userId);
    if(userId){
        return res.status(200).json({ loggedIn: true });
    }
    return res.status(200).json({ loggedIn: false });
}

export const meController = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? null;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
export const checkUsernameController = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const User = await import('../models/user.model.js');
        const count = await User.default.countDocuments({ username });
        res.status(200).json({ exists: count > 0 });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
