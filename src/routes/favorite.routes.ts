import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const favoriteController = new FavoriteController();

router.post('/:taskId', authenticate, favoriteController.addFavorite);
router.delete('/:taskId', authenticate, favoriteController.removeFavorite);
router.get('/', authenticate, favoriteController.getFavorites);
router.get('/:taskId/check', authenticate, favoriteController.checkFavorite);

export default router;
