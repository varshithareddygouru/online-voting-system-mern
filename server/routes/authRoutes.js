import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { protectUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protectUser, getUserProfile)
  .put(protectUser, upload.single('profileImage'), updateUserProfile);

export default router;
