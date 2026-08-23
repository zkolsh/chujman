/**
 * @fileoverview Definición de las rutas REST para la gestión de tareas (nodos) y relaciones (aristas)
 */

import { Router } from 'express';
import { getProjectTasks, getTask, createProjectTask, deleteTask, updateTask, createRelation, deleteRelation } from '../../controllers/task.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();

// Aplicar a todas las rutas de tareas
router.use(authMiddleware.verifyToken);

router.get('/:projectId/tasks', getProjectTasks);
router.get('/:projectId/tasks/:taskId', getTask);
router.post('/:projectId/tasks', createProjectTask);
router.put('/:projectId/tasks/:taskId', updateTask);
router.delete('/:projectId/tasks/:taskId', deleteTask);

router.post('/:projectId/relations', createRelation);
router.delete('/:projectId/relations', deleteRelation);

export default router;
