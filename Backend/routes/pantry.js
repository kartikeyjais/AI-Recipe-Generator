import express from 'express';
const router = express.Router();

import * as pantryController from '../controllers/pantryController.js';
import authMiddleware from '../middleware/auth.js';

// All routes are protesed

router.use(authMiddleware);

router.get('/' , pantryController.getPantryItems);
router.get('/stats' , pantryController.getPantryStats);
router.get('/expiring-soom' , pantryController.getExpiringSoon);
router.post('/' , pantryController.addPantryItem);
router.put('/:id' , pantryController.updatedPantryItem);
router.delete('/:id' , pantryController.deletePantryItem);

export default router;