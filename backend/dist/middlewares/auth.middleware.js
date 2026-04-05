import jwt from 'jsonwebtoken';
export const authenticateToken = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }
    console.log('the secret from auth.middleware.ts:', JWT_SECRET);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid access token' });
        }
        req.user = user;
        next();
    });
};
//# sourceMappingURL=auth.middleware.js.map