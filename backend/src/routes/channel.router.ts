import { Router } from 'express';
import { getChannels, getChannelByUsername, updateChannel, getMyChannel, getAllCategories } from '../controllers/channel.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getChannels);
router.get('/categories', getAllCategories);
router.get('/me', authenticateToken, getMyChannel);
router.get('/:username', getChannelByUsername);
router.put('/:id', authenticateToken, updateChannel);

export default router;
