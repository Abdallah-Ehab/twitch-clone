import { register, login } from '../services/auth.service.js';
import { generateToken } from '../utils/tokenGenerator.js';
import RefreshTokenModel from '../models/refreshToken.model.js';
export const registerController = async (req, res) => {
    try {
        await register(req.body);
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await login(email, password);
        const userId = user._id.toString();
        const accessToken = generateToken({ id: userId, email: user.email }, '15m');
        const refreshToken = generateToken({ id: userId, email: user.email }, '7d');
        await RefreshTokenModel.create({ userId, token: refreshToken });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const savedToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!savedToken)
            throw new Error('Invalid Session');
        const jwt = await import('jsonwebtoken');
        const user = jwt.default.verify(refreshToken, process.env.JWT_SECRET);
        const newAccessToken = generateToken(user, '15m');
        const newRefreshToken = generateToken(user, '7d');
        savedToken.token = newRefreshToken;
        await savedToken.save();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ accessToken: newAccessToken });
    }
    catch (error) {
        res.status(403).json({ error: 'Session expired' });
    }
};
export const logout = async (req, res) => {
    const userId = req.user?.id ?? null;
    if (userId) {
        await RefreshTokenModel.deleteMany({ userId });
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
};
//# sourceMappingURL=auth.controller.js.map