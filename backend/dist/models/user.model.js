import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isLive: { type: Boolean, default: false },
    viewerCount: { type: Number, default: 0 },
    streamkey: { type: String, required: true, unique: true },
    avatarUrl: { type: String, default: '' },
}, { timestamps: true });
userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    catch (error) {
        throw error;
    }
});
const User = model('User', userSchema);
export default User;
//# sourceMappingURL=user.model.js.map