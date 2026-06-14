import prisma from '../config/database.js';

export const taskRepository = {
  async findNodesByProjectId(idProject) {
    return await prisma.archivo.findMany({
      where: { idProject }
    });
  },

  async findEdgesByNodeIds(nodeIds) {
    if (nodeIds.length === 0) return [];
    return await prisma.archivoRelacion.findMany({
      where: { fromId: { in: nodeIds } }
    });
  },

  async createNode(data) {
    return await prisma.archivo.create({
      data
    });
  },

  async updateNode(id, data) {
    return await prisma.archivo.update({
      where: { id },
      data
    });
  },

  async deleteNode(id) {
    return await prisma.archivo.delete({
      where: { id }
    });
  },

  async deleteNodesByProjectId(idProject) {
    return await prisma.archivo.deleteMany({
      where: { idProject }
    });
  },

  async createEdge(data) {
    return await prisma.archivoRelacion.create({
      data
    });
  },

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