/**
 * @fileoverview Interacción con la base de datos (Prisma) para los proyectos
 */

import prisma from '../config/database.js';

/**
 * Repositorio de proyectos
 * @namespace projectRepository
 */

export const projectRepository = {
  /**
   * Busca múltiples proyectos por el ID del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de proyectos ordenados por fecha de creación
   */

  async findManyByUserId(userId) {
    return await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Crea un proyecto en la base de datos
   * @param {Object} data - Datos del proyecto
   * @returns {Promise<Object>} Proyecto creado
   */

  async create(data) {
    return await prisma.project.create({
      data
    });
  },

  /**
   * Busca un proyecto por su ID
   * @param {number} id - ID del proyecto
   * @returns {Promise<Object|null>} Proyecto encontrado o nulo
   */

  async findById(id) {
    return await prisma.project.findUnique({
      where: { id }
    });
  },

  /**
   * Elimina un proyecto por su ID
   * @param {number} id - ID del proyecto a eliminar
   * @returns {Promise<Object>} Objeto eliminado
   */

  async delete(id) {
    return await prisma.project.delete({
      where: { id }
    });
  }
};
