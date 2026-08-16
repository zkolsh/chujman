/**
 * @fileoverview Enrutador que consolida las rutas de la versión 1 de la API
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import usuariosRoutes from './usuarios.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/projects', taskRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/usuarios', usuariosRoutes);

export default router;
