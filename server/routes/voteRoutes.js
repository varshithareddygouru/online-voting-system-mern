import express from 'express';
import { castVote, checkVotedStatus, getElectionResults } from '../controllers/voteController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protectUser, castVote);
router.get('/check/:electionId', protectUser, checkVotedStatus);
router.get('/results/:electionId', getElectionResults);

export default router;
