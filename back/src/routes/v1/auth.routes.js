import {Router} from 'express';
import {authController} from '../../controllers/auth.controller.js';
import {authMiddleware} from '../../middlewares/auth.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/validateToken', authMiddleware.verifyToken, authController.validateToken);

export default router;
