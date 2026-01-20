import { Request, Response, NextFunction } from 'express';
import { FavoriteService } from '../services/favorite.service';
import { AuthRequest } from '../middleware/auth';

export class FavoriteController {
  private favoriteService = new FavoriteService();

  addFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const favorite = await this.favoriteService.addFavorite(taskId, req.user.id);

      res.status(201).json({ message: 'Task added to favorites', favorite });
    } catch (error) {
      next(error);
    }
  };

  removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      await this.favoriteService.removeFavorite(taskId, req.user.id);

      res.json({ message: 'Task removed from favorites' });
    } catch (error) {
      next(error);
    }
  };

  getFavorites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tasks = await this.favoriteService.getFavoriteTasks(req.user.id);

      res.json({ tasks });
    } catch (error) {
      next(error);
    }
  };

  checkFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { taskId } = req.params;
      const isFavorite = await this.favoriteService.isFavorite(taskId, req.user.id);

      res.json({ isFavorite });
    } catch (error) {
      next(error);
    }
  };
}
