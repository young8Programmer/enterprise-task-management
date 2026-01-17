import { Server } from 'socket.io';
import { ActivityType } from '../entities/ActivityLog';

let ioInstance: Server | null = null;

export const setIOInstance = (io: Server): void => {
  ioInstance = io;
};

export interface NotificationData {
  type: ActivityType;
  message: string;
  taskId?: string;
  taskTitle?: string;
  metadata?: Record<string, any>;
}

export const sendNotification = (
  userId: string,
  notification: NotificationData
): void => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification', notification);
  }
};

export const broadcastTaskUpdate = (
  taskId: string,
  notification: NotificationData
): void => {
  if (ioInstance) {
    ioInstance.to(`task:${taskId}`).emit('task-update', notification);
  }
};
