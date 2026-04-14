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
        username: 'moonmoon',
        email: 'moonmoon@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 12300,
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=128&h=128&fit=crop',
        bio: 'Wholesome variety streamer and community builder.',
        tags: ['Variety', 'Community', 'Wholesome']
    },
    {
        username: 'yassuo',
        email: 'yassuo@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 19800,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
        bio: 'League of Legends and variety content.',
        tags: ['League of Legends', 'Variety', 'Entertainment']
    },
    {
        username: 'ironmouse',
        email: 'ironmouse@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 16700,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
        bio: 'VTuber, singer, and positive vibes only.',
        tags: ['VTuber', 'Singing', 'Variety']
    },
    {
        username: 'kyedae',
        email: 'kyedae@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 11200,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop',
        bio: 'FPS games, positivity, and good times.',
        tags: ['Valorant', 'FPS', 'Variety']
    },
    {
        username: 'apEX',
        email: 'apex@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 45600,
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop',
        bio: 'French CS2 legend and competitive gamer.',
        tags: ['CS2', 'FPS', 'Competitive']
    },
    {
        username: 'emiru',
        email: 'emiru@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 8900,
        avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=128&h=128&fit=crop',
        bio: 'Variety content, reactions, and anime lover.',
        tags: ['Just Chatting', 'Anime', 'Variety']
    },
    {
        username: 'Myth',
        email: 'myth@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 13400,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop',
        bio: 'Variety gaming, reactions, and chill vibes.',
        tags: ['Variety', 'Gaming', 'Reactions']
    },
    {
        username: 'HasanAbi',
        email: 'hasanabi@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 34500,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
        bio: 'Political commentary and variety content.',
        tags: ['Just Chatting', 'Politics', 'Variety']
    },
    {
        username: 'summit1g',
        email: 'summit1g@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 24100,
        avatarUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=128&h=128&fit=crop',
        bio: 'GTA RP, variety, and high-octane gaming.',
        tags: ['GTA V', 'RP', 'Variety']
    },
    {
        username: 'Valkyrae',
        email: 'valkyrae@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 28900,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop',
        bio: 'Gaming, variety, and wholesome content.',
        tags: ['Variety', 'Gaming', 'Wholesome']
    },
    {
        username: 'Timthetatman',
        email: 'timthetatman@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 15800,
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop',
        bio: 'Hype streams, gaming, and community love.',
        tags: ['FPS', 'Variety', 'Entertainment']
    },
    {
        username: 'NICKMERCS',
        email: 'nickmercs@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 31200,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop',
        bio: 'Apex Legends, Warzone, and competitive gaming.',
        tags: ['Apex Legends', 'FPS', 'Competitive']
    },
    {
        username: 'Lirik',
        email: 'lirik@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 18200,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop',
        bio: 'Variety gaming, horror games, and reactions.',
        tags: ['Variety', 'Horror', 'Gaming']
    },
    {
        username: ' moistcr1tikal',
        email: 'moistcr1tikal@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 22400,
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=128&h=128&fit=crop',
        bio: 'Reactions, commentary, and variety content.',
        tags: ['Just Chatting', 'Reactions', 'Variety']
    },
    {
        username: 'Amouranth',
        email: 'amouranth@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 19600,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
        bio: 'Just chatting and variety content.',
        tags: ['Just Chatting', 'Variety', 'ASMR']
    },
    {
        username: 'AdinRoss',
        email: 'adinross@example.com',
        password: 'password123',
        isLive: true,
        viewerCount: 25800,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
        bio: 'Callouts, reactions, and high energy content.',
        tags: ['Just Chatting', 'Variety', 'Callouts']
    },
    {
        username: 'KyloRen',
        email: 'kyloren@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop',
        bio: 'Variety streamer and community builder.',
        tags: ['Variety', 'Community', 'Gaming']
    },
    {
        username: 'NorthernLion',
        email: 'northernlion@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop',
        bio: 'Board games, variety, and witty commentary.',
        tags: ['Variety', 'Board Games', 'Commentary']
    },
    {
        username: 'DansGaming',
        email: 'dansgaming@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop',
        bio: 'MMOs, variety, and gaming veteran.',
        tags: ['MMO', 'Variety', 'Gaming']
    },
    {
        username: 'Julius',
        email: 'julius@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
        bio: 'Speedrunner and competitive gaming.',
        tags: ['Speedrunning', 'Competitive', 'Gaming']
    },
    {
        username: 'Jinggg',
        email: 'jinggg@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=128&h=128&fit=crop',
        bio: 'Mobile gaming and variety content.',
        tags: ['Mobile Gaming', 'Variety', 'Gaming']
    },
    {
        username: 'EgirlQueen',
        email: 'egirlqueen@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
        bio: 'Chill vibes, gaming, and good community.',
        tags: ['Variety', 'Chill', 'Gaming']
    },
    {
        username: 'Chica',
        email: 'chica@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop',
        bio: 'Apex Legends pro player and streamer.',
        tags: ['Apex Legends', 'FPS', 'Pro Player']
    },
    {
        username: 'RazePlays',
        email: 'razeplays@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=128&h=128&fit=crop',
        bio: 'FPS games and competitive ranked.',
        tags: ['FPS', 'Competitive', 'Gaming']
    },
    {
        username: 'Pixelated',
        email: 'pixelated@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop',
        bio: 'Retro games and nostalgia content.',
        tags: ['Retro Gaming', 'Variety', 'Nostalgia']
    },
    {
        username: 'Dakotaz',
        email: 'dakotaz@example.com',
        password: 'password123',
        isLive: false,
        viewerCount: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=128&h=128&fit=crop',
        bio: 'Battle royale games and variety.',
        tags: ['Battle Royale', 'Variety', 'Gaming']
    }
];

const bannerImages = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop'
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
        console.log(`Created ${streamers.length} streamers`);
        console.log(`Live streamers: ${streamers.filter(s => s.isLive).length}`);
        console.log(`Offline streamers: ${streamers.filter(s => !s.isLive).length}\n`);
        
        console.log('You can login with these accounts:');
        console.log('Email: ninja@example.com, Password: password123');
        console.log('(All accounts use password: password123)\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
