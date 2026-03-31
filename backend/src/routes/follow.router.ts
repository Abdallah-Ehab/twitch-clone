import { Router } from 'express';
import { followChannel, unfollowChannel } from '../controllers/follow.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/:channelId', authenticateToken, followChannel);
router.delete('/:channelId', authenticateToken, unfollowChannel);

export default router;