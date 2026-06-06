import { taskRepository } from '../repositories/task.repository.js';
import { ESTADOS_VALIDOS } from '../utils/constants.js';

export const taskService = {
  async updateTask(taskId, data) {
    if (data.estado && !ESTADOS_VALIDOS.includes(data.estado)) {
      throw new Error('Estado no válido');
    }
    return await taskRepository.updateNode(taskId, data);
  },

  async getProjectTasks(projectId) {
    const nodes = await taskRepository.findNodesByProjectId(projectId);
    const nodeIds = nodes.map(n => n.id);
    const edges = await taskRepository.findEdgesByNodeIds(nodeIds);
    return { nodes, edges };
  },

  async createProjectTask(projectId, texto) {
    if (!texto) {
      throw new Error('El texto es obligatorio');
    }
    return await taskRepository.createNode({
      idProject: projectId,
      texto
    });
  },

  async createSubtask(projectId, taskId, texto) {
    if (!texto) {
      throw new Error('El texto es obligatorio');
    }

    const newNode = await taskRepository.createNode({
      idProject: projectId,
      texto
    });

    const newEdge = await taskRepository.createEdge({
      fromId: taskId,
      toId: newNode.id
    });

    return { node: newNode, edge: newEdge };
  },

  async deleteTask(taskId) {
    const relations = await taskRepository.findRelationsByFromId(taskId);
    const subtaskIds = relations.map(r => r.toId);
    
    const allIdsToDelete = [taskId, ...subtaskIds];

    await taskRepository.deleteRelationsForNodes(allIdsToDelete);
    await taskRepository.deleteNodes(allIdsToDelete);

    return true;
  }
};
