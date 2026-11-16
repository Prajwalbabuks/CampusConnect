import express from 'express';
import {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireStudent } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/my', protect, requireStudent, getMyRegistrations);
router.post('/:eventId', protect, requireStudent, registerForEvent);
router.delete('/:eventId', protect, requireStudent, cancelRegistration);

export default router;
