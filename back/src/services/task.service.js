/**
 * @fileoverview Lógica de negocio para la gestión de tareas (nodos) y sus relaciones (aristas)
 */

import { taskRepository } from '../repositories/task.repository.js';

/**
 * Servicio de tareas
 * @namespace taskService
 */

export const taskService = {

  /**
   * Obtiene todas las tareas y relaciones de un proyecto específico
   * 
   * @param {number} idProject - ID del proyecto
   * @returns {Promise<Object>} Objeto con las propiedades `nodes` (tareas) y `edges` (relaciones)
   */

  async getProjectTasks(idProject) {
    const nodes = await taskRepository.findNodesByProjectId(idProject);
    const nodeIds = nodes.map(n => n.id);
    const edges = await taskRepository.findEdgesByNodeIds(nodeIds);

    return { nodes, edges };
  },

  /**
   * Crea una nueva tarea asociada a un proyecto
   * 
   * @param {number} idProject - ID del proyecto
   * @param {string} texto - Descripción de la tarea
   * @param {string} [estado='No Iniciado'] - Estado inicial de la tarea
   * @returns {Promise<Object>} Nodo creado
   * @throws {Error} Si falta el texto
   */

  async createProjectTask(idProject, texto, estado = 'No Iniciado') {
    if (!texto || !texto.trim()) {
      throw new Error('El texto es obligatorio');
    }

    return await taskRepository.createNode({
      idProject,
      texto,
      estado
    });
  },

  /**
   * Actualiza los datos de una tarea (texto o estado)
   * 
   * @param {number} id - ID de la tarea
   * @param {Object} data - Datos a actualizar
   * @param {string} [data.texto] - Nuevo texto
   * @param {string} [data.estado] - Nuevo estado
   * @returns {Promise<Object>} Nodo actualizado
   * @throws {Error} Si el estado proporcionado no es válido
   */

  async updateTask(id, data) {
    const validStates = ['No Iniciado', 'En Progreso', 'Completado'];
    if (data.estado && !validStates.includes(data.estado)) {
      throw new Error('Estado no válido');
    }

    const updateData = {};
    if (data.texto !== undefined) updateData.texto = data.texto;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.x !== undefined) updateData.x = data.x;
    if (data.y !== undefined) updateData.y = data.y;

    return await taskRepository.updateNode(id, updateData);
  },

  /**
   * Elimina una tarea y sus relaciones vinculadas (mediante eliminación en cascada de la BD)
   * 
   * @param {number} id - ID de la tarea
   * @returns {Promise<Object>} Resultado de la eliminación
   */

  async deleteTask(id) {
    return await taskRepository.deleteNode(id);
  },

  /**
   * Crea una relación de dependencia (arista) entre dos tareas
   * 
   * @param {number} fromId - ID de la tarea origen
   * @param {number} toId - ID de la tarea destino
   * @returns {Promise<Object>} Arista (relación) creada
   * @throws {Error} Si se intenta relacionar una tarea consigo misma
   */

  async createRelation(fromId, toId) {
    if (fromId === toId) {
      throw new Error('Una tarea no puede depender de sí misma');
    }
    return await taskRepository.createEdge({ fromId, toId });
  },

  /**
   * Elimina una relación específica entre dos tareas
   * 
   * @param {number} fromId - ID de la tarea origen
   * @param {number} toId - ID de la tarea destino
   * @returns {Promise<Object>} Resultado de la eliminación
   */

  async deleteRelation(fromId, toId) {
    return await taskRepository.deleteSpecificEdge(fromId, toId);
  }
};