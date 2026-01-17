import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const activityController = new ActivityController();

router.get('/task/:taskId', authenticate, activityController.getTaskActivity);
router.get('/user', authenticate, activityController.getUserActivity);

export default router;
