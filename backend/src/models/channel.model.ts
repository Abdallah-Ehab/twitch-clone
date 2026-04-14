import { Schema, model, Document, Types } from 'mongoose';

export interface IChannel extends Document {
  owner: Types.ObjectId;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isLive: boolean;
  viewerCount: number;
  streamKey: string;
  category: string;
}

const channelSchema = new Schema<IChannel>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  isLive: { type: Boolean, default: false },
  viewerCount: { type: Number, default: 0 },
  streamKey: { type: String, required: true, unique: true },
  category: { type: String, default: 'Variety' }
}, { timestamps: true });

channelSchema.index({ bio: 'text' });
channelSchema.index({ category: 1 });
channelSchema.index({ isLive: 1, viewerCount: -1 });

const Channel = model<IChannel>('Channel', channelSchema);

export default Channel;
