import express from 'express';
import {
  disableUser,
  demoteUser,
  enableUser,
  getUserDetails,
  listUsers,
  promoteUser,
} from '../controllers/superAdminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireSuperAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireSuperAdmin);

router.get('/users', listUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/promote', promoteUser);
router.patch('/users/:id/demote', demoteUser);
router.patch('/users/:id/disable', disableUser);
router.patch('/users/:id/enable', enableUser);

export default router;
