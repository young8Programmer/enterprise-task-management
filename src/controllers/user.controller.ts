import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Only managers and admins can see all users
      if (req.user.role === UserRole.USER) {
        throw new AppError('You do not have permission to view users', 403);
      }

      const users = await this.userRepository.find({
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'avatar', 'createdAt'],
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });

      res.json({ users });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      // Users can only see their own profile, managers and admins can see anyone
      if (req.user.role === UserRole.USER && req.user.id !== id) {
        throw new AppError('You do not have permission to view this user', 403);
      }

      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'avatar', 'createdAt'],
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  };
}
