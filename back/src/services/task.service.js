import { taskRepository } from '../repositories/task.repository.js';

export const taskService = {
  async getProjectTasks(idProject) {
    const nodes = await taskRepository.findNodesByProjectId(idProject);
    const nodeIds = nodes.map(n => n.id);
    const edges = await taskRepository.findEdgesByNodeIds(nodeIds);

    return { nodes, edges };
  },

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

  async updateTask(id, data) {
    const validStates = ['No Iniciado', 'En Progreso', 'Completado'];
    if (data.estado && !validStates.includes(data.estado)) {
      throw new Error('Estado no válido');
    }

    const updateData = {};
    if (data.texto !== undefined) updateData.texto = data.texto;
    if (data.estado !== undefined) updateData.estado = data.estado;

    return await taskRepository.updateNode(id, updateData);
  },

  async deleteTask(id) {
    return await taskRepository.deleteNode(id);
  },

  async createRelation(fromId, toId) {
    if (fromId === toId) {
      throw new Error('Una tarea no puede depender de sí misma');
    }
    return await taskRepository.createEdge({ fromId, toId });
  },

  async deleteRelation(fromId, toId) {
    return await taskRepository.deleteSpecificEdge(fromId, toId);
  }
};