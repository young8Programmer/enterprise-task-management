import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { AuthRequest } from '../middleware/auth';

export class ActivityController {
  private activityService = new ActivityService();

  getTaskActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const logs = await this.activityService.getTaskActivityLogs(taskId);

      res.json({ logs });
    } catch (error) {
      next(error);
    }
  };

  getUserActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await this.activityService.getUserActivityLogs(req.user.id, limit);

      res.json({ logs });
    } catch (error) {
      next(error);
    }
  };
}
