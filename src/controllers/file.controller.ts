import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/file.service';
import { AuthRequest } from '../middleware/auth';

export class FileController {
  private fileService = new FileService();

  uploadFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { taskId } = req.params;
      const file = await this.fileService.uploadFile(
        taskId,
        req.file,
        req.user.id
      );

      res.status(201).json({ message: 'File uploaded successfully', file });
    } catch (error) {
      next(error);
    }
  };

  getFiles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const files = await this.fileService.getFilesByTask(taskId);

      res.json({ files });
    } catch (error) {
      next(error);
    }
  };

  deleteFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      await this.fileService.deleteFile(id, req.user.id);

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
