import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import commentRoutes from './comment.routes';
import fileRoutes from './file.routes';
import activityRoutes from './activity.routes';
import userRoutes from './user.routes';
import favoriteRoutes from './favorite.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/files', fileRoutes);
router.use('/activity', activityRoutes);
router.use('/users', userRoutes);
router.use('/favorites', favoriteRoutes);

export default router;
