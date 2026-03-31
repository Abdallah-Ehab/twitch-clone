import userModel from "../models/user.model.js";

// we need to add get /streams/live


export const getLiveStreams = async (req: any, res: any) => {
    try {
        const liveUsers = await userModel.find({ isLive: true }).select('username streamkey');
        res.status(200).json(liveUsers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const getStreamStatus = async (req: any, res: any) => {
    try {
        const { channelId } = req.params;
        const user = await userModel.findById(channelId as string);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            isLive: user.isLive,
            viewerCount: user.viewerCount
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
