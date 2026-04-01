import jwt from 'jsonwebtoken';

export const generateToken = (user: { id: string; email: string }, expiresIn: string) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );
};
