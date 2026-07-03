/**
 * @fileoverview Lógica de negocio para la gestión de proyectos
 */

import { projectRepository } from '../repositories/project.repository.js';
import { taskRepository } from '../repositories/task.repository.js';

/**
 * Servicio de proyectos
 * @namespace projectService
 */

export const projectService = {

  /**
   * Obtiene todos los proyectos pertenecientes a un usuario
   * 
   * @param {number} userId - ID del usuario dueño de los proyectos
   * @returns {Promise<Array>} Lista de proyectos encontrados
   */

  async getProjects(userId) {
    return await projectRepository.findManyByUserId(userId);
  },

  /**
   * Crea un nuevo proyecto en la base de datos
   * 
   * @param {number} userId - ID del usuario creador
   * @param {Object} data - Datos del proyecto
   * @param {string} data.name - Nombre del proyecto
   * @param {string} [data.description] - Descripción del proyecto
   * @returns {Promise<Object>} Proyecto recién creado
   */

  async createProject(userId, data) {
    return await projectRepository.create({
      ...data,
      userId
    });
  },

  /**
   * Elimina un proyecto de forma segura, borrando primero sus tareas (nodos) y relaciones (aristas)
   * 
   * @param {number} id - ID del proyecto a eliminar
   * @param {number} userId - ID del usuario que solicita la eliminación
   * @returns {Promise<boolean>} True si se eliminó correctamente
   * @throws {Error} Si el proyecto no existe o el usuario no está autorizado
   */

  async deleteProject(id, userId) {
    const project = await projectRepository.findById(id);
    if (!project || project.userId !== userId) {
      throw new Error('No autorizado');
    }

    const archivos = await taskRepository.findNodesByProjectId(id);
    const archivoIds = archivos.map(a => a.id);

    if (archivoIds.length > 0) {
      await taskRepository.deleteRelationsForNodes(archivoIds);
      await taskRepository.deleteNodesByProjectId(id);
    }

    await projectRepository.delete(id);
    return true;
  }
};
