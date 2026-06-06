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

  async createEdge(data) {
    return await prisma.archivoRelacion.create({
      data
    });
  },

  async findRelationsByFromId(fromId) {
    return await prisma.archivoRelacion.findMany({
      where: { fromId }
    });
  },

  async deleteRelationsForNodes(nodeIds) {
    if (nodeIds.length === 0) return;
    return await prisma.archivoRelacion.deleteMany({
      where: {
        OR: [
          { fromId: { in: nodeIds } },
          { toId: { in: nodeIds } }
        ]
      }
    });
  },

  async deleteNodes(nodeIds) {
    if (nodeIds.length === 0) return;
    return await prisma.archivo.deleteMany({
      where: { id: { in: nodeIds } }
    });
  },

  async deleteNodesByProjectId(idProject) {
    return await prisma.archivo.deleteMany({
      where: { idProject }
    });
  }
};
