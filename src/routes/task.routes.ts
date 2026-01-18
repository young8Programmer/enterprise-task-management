import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
  getTaskSchema,
  deleteTaskSchema,
} from '../validators/task.validator';

const router = Router();
const taskController = new TaskController();

router.post('/', authenticate, validate(createTaskSchema), taskController.createTask);
router.get('/statistics', authenticate, taskController.getStatistics);
router.get('/', authenticate, validate(getTasksSchema), taskController.getTasks);
router.get('/:id', authenticate, validate(getTaskSchema), taskController.getTask);
router.patch('/:id', authenticate, validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', authenticate, validate(deleteTaskSchema), taskController.deleteTask);

export default router;
