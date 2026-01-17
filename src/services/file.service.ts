import { AppDataSource } from '../config/database';
import { FileAttachment } from '../entities/FileAttachment';
import { Task } from '../entities/Task';
import { ActivityLog, ActivityType } from '../entities/ActivityLog';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { AppError } from '../middleware/errorHandler';
import { broadcastTaskUpdate } from '../utils/socket';

export class FileService {
  private fileRepository = AppDataSource.getRepository(FileAttachment);
  private taskRepository = AppDataSource.getRepository(Task);
  private activityLogRepository = AppDataSource.getRepository(ActivityLog);

  async uploadFile(
    taskId: string,
    file: Express.Multer.File,
    userId: string
  ): Promise<FileAttachment> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new AppError('File size exceeds 10MB limit', 400);
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(
      file.buffer,
      `taskflow/tasks/${taskId}`
    );

    // Save file record
    const fileAttachment = this.fileRepository.create({
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      cloudinaryPublicId: publicId,
      task,
      taskId,
    });

    const savedFile = await this.fileRepository.save(fileAttachment);

    // Create activity log
    await this.activityLogRepository.save(
      this.activityLogRepository.create({
        userId,
        taskId,
        activityType: ActivityType.FILE_UPLOADED,
        description: `File "${file.originalname}" uploaded to task "${task.title}"`,
        metadata: {
          filename: file.originalname,
          size: file.size,
        },
      })
    );

    // Broadcast file upload notification
    broadcastTaskUpdate(taskId, {
      type: ActivityType.FILE_UPLOADED,
      message: `File "${file.originalname}" uploaded to task "${task.title}"`,
      taskId: task.id,
      taskTitle: task.title,
      metadata: {
        filename: file.originalname,
        size: file.size,
      },
    });

    return savedFile;
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['task'],
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(file.cloudinaryPublicId);
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error);
    }

    await this.fileRepository.remove(file);
  }

  async getFilesByTask(taskId: string): Promise<FileAttachment[]> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return this.fileRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }
}
