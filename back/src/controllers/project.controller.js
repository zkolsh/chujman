/**
 * @fileoverview Controlador para gestionar los proyectos
 */

import { projectService } from '../services/project.service.js';

/**
 * Obtiene todos los proyectos de un usuario
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.user - Usuario autenticado inyectado por el middleware
 * @param {number} req.user.id - ID del usuario
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} Devuelve un JSON con la lista de proyectos
 */

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await projectService.getProjects(userId);

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

/**
 * Crea un nuevo proyecto para un usuario
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.user - Usuario autenticado inyectado por el middleware
 * @param {Object} req.body - Cuerpo de la petición
 * @param {string} req.body.name - Nombre del proyecto
 * @param {string} [req.body.description] - Descripción del proyecto
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} Devuelve un JSON con el proyecto creado
 */

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

/**
 * Elimina un proyecto de un usuario
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.params - Parámetros de la ruta
 * @param {string} req.params.id - ID del proyecto a eliminar
 * @param {Object} req.user - Usuario autenticado inyectado por el middleware
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} Devuelve un JSON confirmando la eliminación
 */

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