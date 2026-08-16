import { Router } from 'express';
import { usuarioController } from '../../controllers/usuario.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

router.get('/me', usuarioController.getProfile);
router.put('/me', usuarioController.updateProfile);

router.get('/me/facturas', usuarioController.getInvoices);
router.get('/me/facturas/:id', usuarioController.getInvoice);

export default router;
