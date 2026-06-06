import { projectService } from '../services/project.service.js';

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    const projects = await projectService.getProjects(userId);

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const newProject = await projectService.createProject(userId, { name, description });

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    
    await projectService.deleteProject(id, userId);

    res.status(200).json({ success: true, message: 'Proyecto eliminado' });
  } catch (error) {
    if (error.message === 'No autorizado') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    next(error);
  }
};