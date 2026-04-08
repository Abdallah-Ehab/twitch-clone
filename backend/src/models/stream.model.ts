import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    content: string;
    color: string;
    isMod: boolean;
    isVip: boolean;
    isSubscriber: boolean;
    isFirstChat: boolean;
    timestamp: Date;
}

export interface IStream extends Document {
    channel: Types.ObjectId;
    isLive: boolean;
    startedAt: Date;
    endedAt?: Date;
    recentMessages: IMessage[];
}

const messageSchema = new Schema<IMessage>({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    content: { type: String, required: true },
    color: { type: String, default: '#FF4500' },
    isMod: { type: Boolean, default: false },
    isVip: { type: Boolean, default: false },
    isSubscriber: { type: Boolean, default: false },
    isFirstChat: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const streamSchema = new Schema<IStream>({
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, unique: true },
    isLive: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    recentMessages: { type: [messageSchema], default: [] }
}, { timestamps: true });

const Stream = model<IStream>('Stream', streamSchema);

export default Stream;
