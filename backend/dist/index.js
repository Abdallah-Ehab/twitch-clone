import express from "express";
import { createServer } from "http";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import channelRouter from './routes/channel.router.js';
import followRouter from './routes/follow.router.js';
import authRouter from './routes/auth.router.js';
import streamRouter from './routes/stream.router.js';
import { streamManager } from './configs/node_media_server.js';
import { socketService } from './services/socket.service.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/twitch-clone';
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/channels', channelRouter);
app.use('/api/follows', followRouter);
app.use('/api/streams', streamRouter);
app.get("/api/health", (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        streaming: {
            rtmp: 'rtmp://localhost:1935',
            hls: 'http://localhost:8000'
        }
    });
});
app.get("/", (req, res) => {
    res.send("StreamHub API is running!");
});
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
        streamManager.start();
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
const httpServer = createServer(app);
socketService.initialize(httpServer);
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`RTMP Server: rtmp://localhost:1935`);
    console.log(`HLS Server: http://localhost:8000`);
    console.log(`Socket.io: ws://localhost:${PORT}/socket.io`);
    connectDB();
});
//# sourceMappingURL=index.js.map