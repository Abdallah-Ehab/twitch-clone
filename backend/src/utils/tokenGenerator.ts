import jwt from 'jsonwebtoken';

import type { IUser } from '../models/user.model.js';

export const generateToken = (user: IUser, expiresIn: any) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );
};