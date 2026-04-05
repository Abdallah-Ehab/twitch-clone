import jwt from 'jsonwebtoken';

export const generateToken = (user: { id: string; email: string }, expiresIn: string) => {
    console.log(process.env.JWT_SECRET);
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );
};
