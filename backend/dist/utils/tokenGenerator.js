import jwt from 'jsonwebtoken';
export const generateToken = (user, expiresIn) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: expiresIn });
};
//# sourceMappingURL=tokenGenerator.js.map