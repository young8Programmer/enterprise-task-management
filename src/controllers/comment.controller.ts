import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { AuthRequest } from '../middleware/auth';

export class CommentController {
  private commentService = new CommentService();

  createComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const { content } = req.body;

      const comment = await this.commentService.createComment(
        taskId,
        content,
        req.user.id
      );

      res.status(201).json({ message: 'Comment created successfully', comment });
    } catch (error) {
      next(error);
    }
  };

  getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const comments = await this.commentService.getCommentsByTask(taskId);

      res.json({ comments });
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { content } = req.body;

      const comment = await this.commentService.updateComment(
        id,
        content,
        req.user.id
      );

      res.json({ message: 'Comment updated successfully', comment });
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      await this.commentService.deleteComment(id, req.user.id);

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
