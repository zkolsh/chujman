import { Router } from 'express';
import { getProjectTasks, createProjectTask, createSubtask, deleteTask, updateTask } from '../../controllers/task.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();

// Aplicar a todas las rutas de tareas
router.use(authMiddleware.verifyToken);

router.get('/:projectId/tasks', getProjectTasks);

router.post('/:projectId/tasks', createProjectTask);

router.post('/:projectId/tasks/:taskId/subtasks', createSubtask);

router.put('/:projectId/tasks/:taskId', updateTask);

router.delete('/:projectId/tasks/:taskId', deleteTask);

export default router;
