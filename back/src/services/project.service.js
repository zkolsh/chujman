import { projectRepository } from '../repositories/project.repository.js';
import { taskRepository } from '../repositories/task.repository.js';

export const projectService = {
  async getProjects(userId) {
    return await projectRepository.findManyByUserId(userId);
  },

  async createProject(userId, data) {
    return await projectRepository.create({
      ...data,
      userId
    });
  },

  async deleteProject(id, userId) {
    const project = await projectRepository.findById(id);
    if (!project || project.userId !== userId) {
      throw new Error('No autorizado');
    }

    const archivos = await taskRepository.findNodesByProjectId(id);
    const archivoIds = archivos.map(a => a.id);

    if (archivoIds.length > 0) {
      await taskRepository.deleteRelationsForNodes(archivoIds);
      await taskRepository.deleteNodesByProjectId(id);
    }

    await projectRepository.delete(id);
    return true;
  }
};
