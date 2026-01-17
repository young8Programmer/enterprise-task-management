import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthRequest } from '../middleware/auth';

export class TaskController {
  private taskService = new TaskService();

  createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { title, description, priority, deadline, assignedToId } = req.body;
      const deadlineDate = deadline ? new Date(deadline) : undefined;

      const task = await this.taskService.createTask(
        title,
        description,
        req.user.id,
        priority,
        deadlineDate,
        assignedToId
      );

      res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const filters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        assignedToId: req.query.assignedToId as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await this.taskService.getTasks(
        filters,
        req.user.id,
        req.user.role
      );

      res.json({
        tasks: result.tasks,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const task = await this.taskService.getTaskById(id, req.user.id);

      res.json({ task });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { title, description, status, priority, deadline, assignedToId } = req.body;

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) updates.status = status;
      if (priority !== undefined) updates.priority = priority;
      if (deadline !== undefined) updates.deadline = deadline ? new Date(deadline) : null;
      if (assignedToId !== undefined) updates.assignedToId = assignedToId;

      const task = await this.taskService.updateTask(
        id,
        updates,
        req.user.id,
        req.user.role
      );

      res.json({ message: 'Task updated successfully', task });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      await this.taskService.deleteTask(id, req.user.id, req.user.role);

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
