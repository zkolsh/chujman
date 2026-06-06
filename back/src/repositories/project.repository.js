import prisma from '../config/database.js';

export const projectRepository = {
  async findManyByUserId(userId) {
    return await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(data) {
    return await prisma.project.create({
      data
    });
  },

  async findById(id) {
    return await prisma.project.findUnique({
      where: { id }
    });
  },

  async delete(id) {
    return await prisma.project.delete({
      where: { id }
    });
  }
};
