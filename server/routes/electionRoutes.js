import express from 'express';
import {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} from '../controllers/electionController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Election routes
router.route('/')
  .post(protectAdmin, createElection)
  .get(getElections);

router.route('/:id')
  .get(getElectionById)
  .put(protectAdmin, updateElection)
  .delete(protectAdmin, deleteElection);

// Candidate routes inside election scope
router.post('/:id/candidates', protectAdmin, upload.single('photo'), addCandidate);

// Standalone candidate routes
router.route('/candidates/:id')
  .put(protectAdmin, upload.single('photo'), updateCandidate)
  .delete(protectAdmin, deleteCandidate);

export default router;
