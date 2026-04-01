import { Schema, model } from 'mongoose';
const channelSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    isLive: { type: Boolean, default: false },
    viewerCount: { type: Number, default: 0 },
    streamKey: { type: String, required: true, unique: true }
}, { timestamps: true });
const Channel = model('Channel', channelSchema);
export default Channel;
//# sourceMappingURL=channel.model.js.map