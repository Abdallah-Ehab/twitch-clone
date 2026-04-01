import { Router } from 'express';
import { getChannels, getChannelByUsername, updateChannel } from '../controllers/channel.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/', getChannels);
router.get('/:username', getChannelByUsername);
router.put('/:id', authenticateToken, updateChannel);
export default router;
//# sourceMappingURL=channel.router.js.map