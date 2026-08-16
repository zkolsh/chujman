import { Router } from 'express';
import { subscriptionController } from '../../controllers/subscription.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();

// Ruta de checkout protegida
router.post('/checkout', authMiddleware.verifyToken, subscriptionController.checkout);
router.post('/cancel', authMiddleware.verifyToken, subscriptionController.cancel);
router.post('/downgrade', authMiddleware.verifyToken, subscriptionController.downgrade);

export default router;
