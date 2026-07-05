/**
 * @fileoverview Controlador para gestionar las tareas y relaciones de los proyectos
 */

import { taskService } from '../services/task.service.js';

/**
 * Obtiene todas las tareas (nodos) y relaciones (aristas) de un proyecto
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.params - Parámetros de la ruta
 * @param {string} req.params.projectId - ID del proyecto
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} JSON con los nodos y edges del grafo
 */

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

/**
 * Crea una nueva tarea (nodo) en un proyecto
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.params - Parámetros de la ruta
 * @param {string} req.params.projectId - ID del proyecto
 * @param {Object} req.body - Cuerpo de la petición
 * @param {string} [req.body.texto] - Texto de la nueva tarea
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} JSON con la tarea creada
 */

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

/**
 * Elimina una tarea y sus relaciones asociadas
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.params - Parámetros de la ruta
 * @param {string} req.params.taskId - ID de la tarea a eliminar
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} JSON confirmando la eliminación
 */

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

/**
 * Actualiza una tarea existente
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.params - Parámetros de la ruta
 * @param {string} req.params.taskId - ID de la tarea
 * @param {Object} req.body - Cuerpo de la petición
 * @param {string} [req.body.texto] - Nuevo texto de la tarea
 * @param {string} [req.body.estado] - Nuevo estado de la tarea
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} JSON con la tarea actualizada
 */

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    // Extract deadline from req.body
    const { texto, estado, x, y, deadline } = req.body; 

    const result = await taskService.updateTask(parseInt(taskId), { 
      texto, 
      estado, 
      x, 
      y, 
      deadline 
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Estado no válido') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Crea una relación (arista) entre dos tareas
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.body - Cuerpo de la petición
 * @param {number|string} req.body.fromId - ID de la tarea de origen
 * @param {number|string} req.body.toId - ID de la tarea de destino
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} JSON con la relación creada
 */

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

/**
 * Elimina una relación entre dos tareas
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.body - Cuerpo de la petición
 * @param {number|string} req.body.fromId - ID de la tarea de origen
 * @param {number|string} req.body.toId - ID de la tarea de destino
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para manejo de errores
 * @returns {Promise<void>} JSON confirmando la eliminación
 */

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
