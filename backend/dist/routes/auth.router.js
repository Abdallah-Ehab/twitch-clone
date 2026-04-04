import { Router } from 'express';
import { loginController, refreshTokenController, registerController, isLoggedInController, meController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
const router = Router();
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshTokenController);
router.get('/is-logged-in', isLoggedInController);
router.get('/me', authenticateToken, meController);
export default router;
//# sourceMappingURL=auth.router.js.map