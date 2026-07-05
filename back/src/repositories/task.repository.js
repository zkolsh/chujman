/**
 * @fileoverview Interacción con la base de datos (Prisma) para tareas (nodos) y relaciones (aristas)
 */

import prisma from '../config/database.js';

/**
 * Repositorio de tareas y relaciones
 * @namespace taskRepository
 */

export const taskRepository = {

  /**
   * Busca todos los nodos asociados a un proyecto
   * @param {number} idProject - ID del proyecto
   * @returns {Promise<Array>} Lista de nodos (tareas)
   */

  async findNodesByProjectId(idProject) {
    return await prisma.archivo.findMany({
      where: { idProject }
    });
  },
  
  /**
   * Busca un nodo por su ID
   * @param {number} id - ID del nodo
   * @returns {Promise<Object|null>} El nodo o null si no existe
   */
  async findNodeById(id) {
    return await prisma.archivo.findUnique({
      where: { id }
    });
  },

  /**
   * Busca todas las aristas (relaciones) cuyo fromId se encuentre en un arreglo dado
   * @param {number[]} nodeIds - Arreglo de IDs de nodos
   * @returns {Promise<Array>} Lista de aristas
   */

  async findEdgesByNodeIds(nodeIds) {
    if (nodeIds.length === 0) return [];
    return await prisma.archivoRelacion.findMany({
      where: { fromId: { in: nodeIds } }
    });
  },

  /**
   * Crea un nodo (tarea)
   * @param {Object} data - Datos a guardar
   * @returns {Promise<Object>} Nodo creado
   */

  async createNode(data) {
    return await prisma.archivo.create({
      data
    });
  },

  /**
   * Actualiza un nodo (tarea)
   * @param {number} id - ID del nodo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Nodo actualizado
   */

  async updateNode(id, data) {
    return await prisma.archivo.update({
      where: { id },
      data
    });
  },

  /**
   * Elimina un nodo (tarea)
   * @param {number} id - ID del nodo
   * @returns {Promise<Object>} Nodo eliminado
   */

  async deleteNode(id) {
    return await prisma.archivo.delete({
      where: { id }
    });
  },

  /**
   * Elimina todos los nodos pertenecientes a un proyecto
   * @param {number} idProject - ID del proyecto
   * @returns {Promise<Object>} Resultado de la eliminación (Prisma BatchPayload)
   */

  async deleteNodesByProjectId(idProject) {
    return await prisma.archivo.deleteMany({
      where: { idProject }
    });
  },

  /**
   * Crea una arista (relación) entre dos nodos
   * @param {Object} data - Datos de la arista (fromId, toId)
   * @returns {Promise<Object>} Arista creada
   */

  async createEdge(data) {
    return await prisma.archivoRelacion.create({
      data
    });
  },

  /**
   * Elimina una relación específica usando sus extremos
   * @param {number} fromId - ID origen
   * @param {number} toId - ID destino
   * @returns {Promise<Object>} Resultado de la eliminación
   */

  async deleteSpecificEdge(fromId, toId) {
    // deleteMany se usa aquí porque no tenemos el ID exacto de la relación,
    // solo sabemos quiénes la componen.
    return await prisma.archivoRelacion.deleteMany({
      where: {
        fromId: fromId,
        toId: toId
      }
    });
  }
};