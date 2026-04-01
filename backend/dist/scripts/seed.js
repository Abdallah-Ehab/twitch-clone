import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();
import User from '../models/user.model.js';
import Channel from '../models/channel.model.js';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/twitch-clone';
const streamers = [
    {
        username: 'ninja',
        email: 'ninja@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 45200,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop',
        bio: 'Professional gamer and content creator. FPS specialist.',
        tags: ['Fortnite', 'FPS', 'Competitive']
    },
    {
        username: 'pokimane',
        email: 'pokimane@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 28500,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop',
        bio: 'Variety streamer, anime enthusiast, and gaming community builder.',
        tags: ['Just Chatting', 'Variety', 'Gaming']
    },
    {
        username: 'shroud',
        email: 'shroud@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 32100,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
        bio: 'Former pro player, now streaming FPS games daily.',
        tags: ['Valorant', 'FPS', 'Competitive']
    },
    {
        username: 'sykkuno',
        email: 'sykkuno@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 18900,
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop',
        bio: 'Chill vibes, variety content, and good times.',
        tags: ['GTA V', 'RP', 'Variety']
    },
    {
        username: 'ludwig',
        email: 'ludwig@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 22100,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop',
        bio: 'Variety streamer, mogul money, and creator economy enthusiast.',
        tags: ['Variety', 'Content Creation', 'Events']
    },
    {
        username: 'xqc',
        email: 'xqc@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 67800,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop',
        bio: 'Reactions, variety, and chaotic energy.',
        tags: ['Just Chatting', 'Variety', 'Reactions']
    },
    {
        username: 's1mple',
        email: 's1mple@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 89400,
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop',
        bio: 'CS2 professional player. The GOAT.',
        tags: ['CS2', 'FPS', 'Competitive']
    },
    {
        username: 'fuslie',
        email: 'fuslie@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 15600,
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop',
        bio: 'Variety streamer, musician, and overall amazing human.',
        tags: ['Variety', 'Music', 'Chill']
    },
    {
        username: 'summit1g',
        email: 'summit1g@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=128&h=128&fit=crop',
        bio: 'GTA RP, variety, and chill streams.',
        tags: ['GTA V', 'RP', 'Variety']
    },
    {
        username: 'timthetatman',
        email: 'timthetatman@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop',
        bio: 'Hype streams, gaming, and community love.',
        tags: ['FPS', 'Variety', 'Entertainment']
    }
];
const categories = [
    { name: 'Fortnite', viewerCount: '125K', streams: 892 },
    { name: 'Valorant', viewerCount: '98K', streams: 654 },
    { name: 'Just Chatting', viewerCount: '234K', streams: 1234 },
    { name: 'GTA V', viewerCount: '67K', streams: 445 },
    { name: 'League of Legends', viewerCount: '156K', streams: 987 },
    { name: 'Minecraft', viewerCount: '89K', streams: 567 },
    { name: 'CS2', viewerCount: '112K', streams: 723 },
    { name: 'Apex Legends', viewerCount: '45K', streams: 321 }
];
const bannerImages = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&h=400&fit=crop'
];
async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Channel.deleteMany({});
        console.log('Seeding users and channels...');
        for (let i = 0; i < streamers.length; i++) {
            const streamer = streamers[i];
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(streamer.password, salt);
            const user = await User.create({
                username: streamer.username,
                email: streamer.email,
                password: hashedPassword,
                isLive: streamer.isLive,
                viewerCount: streamer.viewerCount,
                avatarUrl: streamer.avatarUrl,
                streamkey: `live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
            });
            await Channel.create({
                owner: user._id,
                bio: streamer.bio,
                avatarUrl: streamer.avatarUrl,
                bannerUrl: bannerImages[i % bannerImages.length],
                isLive: streamer.isLive,
                viewerCount: streamer.viewerCount,
                streamKey: user.streamkey
            });
            console.log(`Created user: ${streamer.username}`);
        }
        console.log('\n✅ Seeding completed successfully!');
        console.log(`Created ${streamers.length} streamers\n`);
        console.log('You can login with these accounts:');
        console.log('Email: ninja@example.com, Password: password123');
        console.log('(All accounts use password: password123)\n');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map