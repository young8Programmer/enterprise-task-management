import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);

export default router;
