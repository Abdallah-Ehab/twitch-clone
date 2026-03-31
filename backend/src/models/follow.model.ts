import { Schema, model, Document, Types } from 'mongoose';

export interface IFollow extends Document {
  follower: Types.ObjectId;
  channel: Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Add MongoDB index on Follow: { follower: 1, channel: 1 } unique — prevents duplicate follows
followSchema.index({ follower: 1, channel: 1 }, { unique: true });

const Follow = model<IFollow>('Follow', followSchema);

export default Follow;