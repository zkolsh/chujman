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

export const deleteProject = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user owns the project
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    // Encuentra todos los archivos de este proyecto
    const archivos = await prisma.archivo.findMany({ where: { idProject: id } });
    const archivoIds = archivos.map(a => a.id);

    if (archivoIds.length > 0) {
      // Elimina las relaciones primero para evitar errores de Foreign Key en SQLite
      await prisma.archivoRelacion.deleteMany({
        where: {
          OR: [
            { fromId: { in: archivoIds } },
            { toId: { in: archivoIds } }
          ]
        }
      });

      // Elimina los archivos (tareas/subtareas)
      await prisma.archivo.deleteMany({
        where: { idProject: id }
      });
    }

    // Delete project
    await prisma.project.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Proyecto eliminado' });
  } catch (error) {
    next(error);
  }
};