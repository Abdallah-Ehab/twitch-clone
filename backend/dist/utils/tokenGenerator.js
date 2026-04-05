import jwt from 'jsonwebtoken';
export const generateToken = (user, expiresIn) => {
    console.log(process.env.JWT_SECRET);
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: expiresIn });
};
//# sourceMappingURL=tokenGenerator.js.map