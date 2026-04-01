import { Schema, model } from 'mongoose';
const refreshTokenSchema = new Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' }
});
const RefreshTokenModel = model('RefreshToken', refreshTokenSchema);
export default RefreshTokenModel;
//# sourceMappingURL=refreshToken.model.js.map