import {register, login} from '../services/auth.service.js';
import { generateToken } from '../utils/tokenGenerator.js';
import RefreshTokenModel from '../models/refreshToken.model.js';
import jwt from 'jsonwebtoken';
import type { NextFunction,Response,Request } from 'express';




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
        const accessToken = generateToken(user, '15m');
        const refreshToken = generateToken(user, '7d');


        await RefreshTokenModel.create({ userId: user.id, token: refreshToken });


        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        res.status(200).json({ message: 'Login successful', user, accessToken });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const refreshTokenController = async (req: Request, res: Response) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {

        const savedToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!savedToken) throw new Error('Invalid Session');


        const user = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as any;
        const newAccessToken = generateToken(user, '15m');
        const newRefreshToken = generateToken(user, '7d');


        savedToken.token = newRefreshToken;
        await savedToken.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ error: 'Session expired' });
    }
}

export const logout = (req:Request,res:Response,next:NextFunction)=>{
    const userId = req.user?.id ?? null;
    if(userId){
        RefreshTokenModel.deleteMany({ userId }).catch((err: Error) => console.error('Error clearing refresh tokens:', err));
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
}