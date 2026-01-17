import { AppDataSource } from '../config/database';
import { Comment } from '../entities/Comment';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { ActivityLog, ActivityType } from '../entities/ActivityLog';
import { AppError } from '../middleware/errorHandler';
import { broadcastTaskUpdate } from '../utils/socket';

export class CommentService {
  private commentRepository = AppDataSource.getRepository(Comment);
  private taskRepository = AppDataSource.getRepository(Task);
  private activityLogRepository = AppDataSource.getRepository(ActivityLog);

  async createComment(
    taskId: string,
    content: string,
    userId: string
  ): Promise<Comment> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const comment = this.commentRepository.create({
      content,
      task,
      user,
      userId,
      taskId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Create activity log
    await this.activityLogRepository.save(
      this.activityLogRepository.create({
        userId,
        taskId,
        activityType: ActivityType.COMMENT_ADDED,
        description: `Comment added to task "${task.title}"`,
      })
    );

    // Broadcast comment notification
    broadcastTaskUpdate(taskId, {
      type: ActivityType.COMMENT_ADDED,
      message: `New comment added to task "${task.title}"`,
      taskId: task.id,
      taskTitle: task.title,
    });

    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'task'],
    }) as Promise<Comment>;
  }

  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return this.commentRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateComment(
    commentId: string,
    content: string,
    userId: string
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'task'],
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== userId) {
      throw new AppError('You can only update your own comments', 403);
    }

    comment.content = content;
    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['task'],
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== userId) {
      throw new AppError('You can only delete your own comments', 403);
    }

    await this.commentRepository.remove(comment);
  }
}
