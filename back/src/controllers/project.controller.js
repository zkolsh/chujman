import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

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

    const newProject = await prisma.project.create({
      data: { name, description, userId }
    });

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    next(error);
  }
};