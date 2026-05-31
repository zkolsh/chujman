import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const idProject = parseInt(projectId);

    const nodes = await prisma.archivo.findMany({
      where: { idProject }
    });

    const nodeIds = nodes.map(n => n.id);

    const edges = await prisma.archivoRelacion.findMany({
      where: { fromId: { in: nodeIds } }
    });

    res.status(200).json({ success: true, data: { nodes, edges } });
  } catch (error) {
    next(error);
  }
};

export const createProjectTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ success: false, message: 'El texto es obligatorio' });
    }

    const newNode = await prisma.archivo.create({
      data: {
        idProject: parseInt(projectId),
        texto
      }
    });

    res.status(201).json({ success: true, data: newNode });
  } catch (error) {
    next(error);
  }
};

export const createSubtask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ success: false, message: 'El texto es obligatorio' });
    }

    const newNode = await prisma.archivo.create({
      data: {
        idProject: parseInt(projectId),
        texto
      }
    });

    const newEdge = await prisma.archivoRelacion.create({
      data: {
        fromId: parseInt(taskId),
        toId: newNode.id
      }
    });

    res.status(201).json({ success: true, data: { node: newNode, edge: newEdge } });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const id = parseInt(taskId);

    // Find all subtasks belonging to this task
    const relations = await prisma.archivoRelacion.findMany({
      where: { fromId: id }
    });
    const subtaskIds = relations.map(r => r.toId);

    const allIdsToDelete = [id, ...subtaskIds];

    // Eliminar las relaciones manualmente para evitar problemas de Foreign Key en SQLite
    await prisma.archivoRelacion.deleteMany({
      where: {
        OR: [
          { fromId: { in: allIdsToDelete } },
          { toId: { in: allIdsToDelete } }
        ]
      }
    });

    // Eliminar los nodos (tarea principal y subtareas)
    await prisma.archivo.deleteMany({
      where: { id: { in: allIdsToDelete } }
    });

    res.status(200).json({ success: true, message: 'Tarea y subtareas eliminadas' });
  } catch (error) {
    next(error);
  }
};
