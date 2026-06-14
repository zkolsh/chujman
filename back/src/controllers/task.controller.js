import { taskService } from '../services/task.service.js';

export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const idProject = parseInt(projectId);

    const result = await taskService.getProjectTasks(idProject);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createProjectTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { texto } = req.body;

    const newNode = await taskService.createProjectTask(parseInt(projectId), texto);

    res.status(201).json({ success: true, data: newNode });
  } catch (error) {
    if (error.message === 'El texto es obligatorio') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};


export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const id = parseInt(taskId);

    await taskService.deleteTask(id);

    res.status(200).json({ success: true, message: 'Tarea y subtareas eliminadas' });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { texto, estado } = req.body;

    const result = await taskService.updateTask(parseInt(taskId), { texto, estado });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Estado no válido') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const createRelation = async (req, res, next) => {
  try {
    const { fromId, toId } = req.body;
    
    if (!fromId || !toId) {
      return res.status(400).json({ success: false, message: 'fromId y toId son obligatorios' });
    }

    const relation = await taskService.createRelation(parseInt(fromId), parseInt(toId));
    res.status(201).json({ success: true, data: relation });
  } catch (error) {
    next(error);
  }
};

export const deleteRelation = async (req, res, next) => {
  try {
    const { fromId, toId } = req.body;

    if (!fromId || !toId) {
      return res.status(400).json({ success: false, message: 'fromId y toId son obligatorios' });
    }

    await taskService.deleteRelation(parseInt(fromId), parseInt(toId));
    res.status(200).json({ success: true, message: 'Relación eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};