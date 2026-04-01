import { Schema, model } from 'mongoose';
const followSchema = new Schema({
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Add MongoDB index on Follow: { follower: 1, channel: 1 } unique — prevents duplicate follows
followSchema.index({ follower: 1, channel: 1 }, { unique: true });
const Follow = model('Follow', followSchema);
export default Follow;
//# sourceMappingURL=follow.model.js.map