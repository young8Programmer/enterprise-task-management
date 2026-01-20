import { AppDataSource } from '../config/database';
import { TaskFavorite } from '../entities/TaskFavorite';
import { Task } from '../entities/Task';
import { AppError } from '../middleware/errorHandler';

export class FavoriteService {
  private favoriteRepository = AppDataSource.getRepository(TaskFavorite);
  private taskRepository = AppDataSource.getRepository(Task);

  async addFavorite(taskId: string, userId: string): Promise<TaskFavorite> {
    // Check if task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: { taskId, userId },
    });

    if (existing) {
      throw new AppError('Task already in favorites', 400);
    }

    const favorite = this.favoriteRepository.create({
      taskId,
      userId,
    });

    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(taskId: string, userId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { taskId, userId },
    });

    if (!favorite) {
      throw new AppError('Task not in favorites', 404);
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getFavoriteTasks(userId: string): Promise<Task[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['task', 'task.createdBy', 'task.assignedTo'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map((f) => f.task);
  }

  async isFavorite(taskId: string, userId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { taskId, userId },
    });

    return !!favorite;
  }
}
