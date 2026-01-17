import { AppDataSource } from '../config/database';
import { ActivityLog } from '../entities/ActivityLog';
import { AppError } from '../middleware/errorHandler';

export class ActivityService {
  private activityLogRepository = AppDataSource.getRepository(ActivityLog);

  async getTaskActivityLogs(taskId: string): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivityLogs(
    userId: string,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { userId },
      relations: ['task'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
