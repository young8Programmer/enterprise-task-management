import { AppDataSource } from '../config/database';
import { Task, TaskStatus, TaskPriority } from '../entities/Task';
import { User } from '../entities/User';
import { ActivityLog, ActivityType } from '../entities/ActivityLog';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../entities/User';
import { sendTaskAssignmentEmail } from '../utils/email';
import { sendNotification, broadcastTaskUpdate } from '../utils/socket';
import { FindOptionsWhere, ILike } from 'typeorm';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class TaskService {
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);
  private activityLogRepository = AppDataSource.getRepository(ActivityLog);

  async createTask(
    title: string,
    description: string,
    createdById: string,
    priority?: TaskPriority,
    deadline?: Date,
    assignedToId?: string
  ): Promise<Task> {
    const createdBy = await this.userRepository.findOne({
      where: { id: createdById },
    });

    if (!createdBy) {
      throw new AppError('User not found', 404);
    }

    let assignedTo: User | null = null;
    if (assignedToId) {
      assignedTo = await this.userRepository.findOne({
        where: { id: assignedToId },
      });
      if (!assignedTo) {
        throw new AppError('Assigned user not found', 404);
      }
    }

    const task = this.taskRepository.create({
      title,
      description,
      createdBy,
      createdById,
      assignedTo,
      assignedToId: assignedTo?.id || null,
      priority: priority || TaskPriority.MEDIUM,
      deadline: deadline || null,
      status: TaskStatus.TODO,
    });

    const savedTask = await this.taskRepository.save(task);

    // Create activity log
    await this.createActivityLog(
      createdById,
      savedTask.id,
      ActivityType.TASK_CREATED,
      `Task "${title}" was created`
    );

    // Send email and socket notification if assigned
    if (assignedTo) {
      try {
        await sendTaskAssignmentEmail(
          assignedTo.email,
          title,
          `${createdBy.firstName} ${createdBy.lastName}`
        );
      } catch (error) {
        console.error('Failed to send assignment email:', error);
      }

      // Send real-time notification
      sendNotification(assignedTo.id, {
        type: ActivityType.TASK_ASSIGNED,
        message: `You have been assigned a new task: ${title}`,
        taskId: savedTask.id,
        taskTitle: title,
      });
    }

    return this.getTaskById(savedTask.id, createdById);
  }

  async getTasks(
    filters: TaskFilters,
    userId: string,
    userRole: UserRole
  ): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Task> = {};

    // Role-based filtering
    if (userRole === UserRole.USER) {
      // Users can only see tasks assigned to them or created by them
      where.assignedToId = userId;
    } else if (userRole === UserRole.MANAGER) {
      // Managers can see tasks they created or assigned
      // This will be handled in the query builder
    }
    // Admins can see all tasks

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.attachments', 'attachments')
      .orderBy('task.createdAt', 'DESC');

    // Apply role-based filtering
    if (userRole === UserRole.USER) {
      queryBuilder.where(
        '(task.assignedToId = :userId OR task.createdById = :userId)',
        { userId }
      );
    } else if (userRole === UserRole.MANAGER) {
      queryBuilder.where(
        '(task.createdById = :userId OR task.assignedToId IS NOT NULL)',
        { userId }
      );
    }

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.assignedToId) {
      queryBuilder.andWhere('task.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const [tasks, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { tasks, total, page, limit };
  }

  async getTaskById(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['createdBy', 'assignedTo', 'comments', 'comments.user', 'attachments'],
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  async updateTask(
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      deadline?: Date;
      assignedToId?: string | null;
    },
    userId: string,
    userRole: UserRole
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['createdBy', 'assignedTo'],
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Authorization check
    if (
      userRole === UserRole.USER &&
      task.assignedToId !== userId &&
      task.createdById !== userId
    ) {
      throw new AppError('You do not have permission to update this task', 403);
    }

    const oldStatus = task.status;
    const oldAssignedToId = task.assignedToId;

    // Update fields
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined)
      task.description = updates.description;
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.deadline !== undefined) task.deadline = updates.deadline;

    // Handle assignment
    if (updates.assignedToId !== undefined) {
      if (updates.assignedToId) {
        const assignedTo = await this.userRepository.findOne({
          where: { id: updates.assignedToId },
        });
        if (!assignedTo) {
          throw new AppError('Assigned user not found', 404);
        }
        task.assignedTo = assignedTo;
        task.assignedToId = updates.assignedToId;
      } else {
        task.assignedTo = null;
        task.assignedToId = null;
      }
    }

    const savedTask = await this.taskRepository.save(task);

    // Create activity logs
    if (updates.status && updates.status !== oldStatus) {
      await this.createActivityLog(
        userId,
        taskId,
        ActivityType.TASK_STATUS_CHANGED,
        `Task status changed from ${oldStatus} to ${updates.status}`
      );

      // Broadcast status change
      broadcastTaskUpdate(taskId, {
        type: ActivityType.TASK_STATUS_CHANGED,
        message: `Task status changed from ${oldStatus} to ${updates.status}`,
        taskId: task.id,
        taskTitle: task.title,
        metadata: { oldStatus, newStatus: updates.status },
      });
    }

    if (
      updates.assignedToId !== undefined &&
      updates.assignedToId !== oldAssignedToId
    ) {
      await this.createActivityLog(
        userId,
        taskId,
        ActivityType.TASK_ASSIGNED,
        updates.assignedToId
          ? `Task assigned to user ${updates.assignedToId}`
          : 'Task unassigned'
      );

      // Send email and socket notification
      if (updates.assignedToId && task.assignedTo) {
        try {
          const assigner = await this.userRepository.findOne({
            where: { id: userId },
          });
          await sendTaskAssignmentEmail(
            task.assignedTo.email,
            task.title,
            assigner
              ? `${assigner.firstName} ${assigner.lastName}`
              : 'System'
          );
        } catch (error) {
          console.error('Failed to send assignment email:', error);
        }

        // Send real-time notification
        sendNotification(task.assignedTo.id, {
          type: ActivityType.TASK_ASSIGNED,
          message: `You have been assigned a new task: ${task.title}`,
          taskId: task.id,
          taskTitle: task.title,
        });
      }

      // Broadcast task update to all users watching this task
      broadcastTaskUpdate(taskId, {
        type: ActivityType.TASK_ASSIGNED,
        message: `Task assignment updated`,
        taskId: task.id,
        taskTitle: task.title,
      });
    }

    if (
      updates.title !== undefined ||
      updates.description !== undefined ||
      updates.priority !== undefined
    ) {
      await this.createActivityLog(
        userId,
        taskId,
        ActivityType.TASK_UPDATED,
        'Task details were updated'
      );

      // Broadcast task update
      broadcastTaskUpdate(taskId, {
        type: ActivityType.TASK_UPDATED,
        message: 'Task details were updated',
        taskId: task.id,
        taskTitle: task.title,
      });
    }

    return this.getTaskById(savedTask.id, userId);
  }

  async deleteTask(
    taskId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Only admin or creator can delete
    if (userRole !== UserRole.ADMIN && task.createdById !== userId) {
      throw new AppError('You do not have permission to delete this task', 403);
    }

    await this.taskRepository.remove(task);

    await this.createActivityLog(
      userId,
      null,
      ActivityType.TASK_DELETED,
      `Task "${task.title}" was deleted`
    );
  }

  private async createActivityLog(
    userId: string,
    taskId: string | null,
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const log = this.activityLogRepository.create({
      userId,
      taskId,
      activityType,
      description,
      metadata,
    });
    await this.activityLogRepository.save(log);
  }
}
