import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
} from '../validators/comment.validator';

const router = Router();
const commentController = new CommentController();

router.post('/:taskId', authenticate, validate(createCommentSchema), commentController.createComment);
router.get('/:taskId', authenticate, commentController.getComments);
router.patch('/:id', authenticate, validate(updateCommentSchema), commentController.updateComment);
router.delete('/:id', authenticate, validate(deleteCommentSchema), commentController.deleteComment);

export default router;
