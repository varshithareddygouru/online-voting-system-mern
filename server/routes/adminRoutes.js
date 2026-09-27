import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getVoters,
  approveVoter,
  rejectVoter,
  toggleLockVoter,
  getDashboardAnalytics,
  getActivityLogs,
} from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for admin accounts
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes for admins
router.get('/voters', protectAdmin, getVoters);
router.put('/voters/:id/approve', protectAdmin, approveVoter);
router.put('/voters/:id/lock', protectAdmin, toggleLockVoter);
router.delete('/voters/:id', protectAdmin, rejectVoter);

router.get('/analytics', protectAdmin, getDashboardAnalytics);
router.get('/audit-logs', protectAdmin, getActivityLogs);

export default router;
