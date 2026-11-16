import express from 'express';
import {
  getDashboardStats,
  getEventParticipants,
  toggleAttendanceCheckIn,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/events/:id/participants', getEventParticipants);
router.patch('/registrations/:registrationId/checkin', toggleAttendanceCheckIn);

export default router;
