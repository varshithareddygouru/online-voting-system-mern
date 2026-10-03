import mongoose from 'mongoose';
import crypto from 'crypto';
import Vote from '../models/Vote.js';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

// @desc    Cast a vote in an active election
// @route   POST /api/votes
// @access  Private/Voter
export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    // 1. Verify User status
    if (!req.user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your registration is not approved yet. You cannot vote.' });
    }

    // 2. Verify Election status
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This election is not currently active' });
    }

    // Verify candidate exists and belongs to the election
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found in this election' });
    }

    // 3. Generate Anonymous Hash for voter verification
    // Hash is derived from: User ID + Election ID + Secret Salt (optional, using JWT_SECRET here)
    const salt = process.env.JWT_SECRET || 'voting_jwt_secret_key_2026_premium_app';
    const voterHash = crypto
      .createHash('sha256')
      .update(userId.toString() + electionId.toString() + salt)
      .digest('hex');

    // 4. Double Vote Prevention: check if vote already exists for this voterHash
    const voteExists = await Vote.findOne({ voterHash, election: electionId });
    if (voteExists) {
      return res.status(400).json({ success: false, message: 'Security Alert: You have already cast your vote in this election!' });
    }

    // 5. Cast the vote
    const newVote = await Vote.create({
      voterHash,
      election: electionId,
      candidate: candidateId,
    });

    // 6. Send notification to the user
    await Notification.create({
      user: userId,
      title: 'Vote Casted Successfully',
      message: `Your vote in the election "${election.title}" has been securely recorded.`,
    });

    // 7. Audit log (log that the voter voted, but NOT who they voted for to ensure ballot secrecy)
    await ActivityLog.create({
      user: userId,
      userType: 'User',
      username: req.user.fullName,
      action: `Cast vote in Election: ${election.title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({
      success: true,
      message: 'Vote submitted successfully! Your ballot is locked forever.',
      data: {
        electionId,
        timestamp: newVote.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    // Handle database compound unique key violation (just in case)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Security Alert: You have already cast your vote in this election!' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if current voter has voted in specified election
// @route   GET /api/votes/check/:electionId
// @access  Private/Voter
export const checkVotedStatus = async (req, res) => {
  try {
    const electionId = req.params.electionId;
    const userId = req.user._id;
    const salt = process.env.JWT_SECRET || 'voting_jwt_secret_key_2026_premium_app';
    const voterHash = crypto
      .createHash('sha256')
      .update(userId.toString() + electionId.toString() + salt)
      .digest('hex');

    const vote = await Vote.findOne({ voterHash, election: electionId });

    return res.json({
      success: true,
      hasVoted: !!vote,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get live results for an election
// @route   GET /api/votes/results/:electionId
// @access  Public
export const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).populate('candidates');
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Aggregate votes by candidate
    const voteCounts = await Vote.aggregate([
      { $match: { election: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: '$candidate', count: { $sum: 1 } } },
    ]);

    // Create a map for fast lookup
    const voteMap = {};
    voteCounts.forEach((vc) => {
      voteMap[vc._id.toString()] = vc.count;
    });

    // Structure results
    const results = election.candidates.map((candidate) => ({
      _id: candidate._id,
      name: candidate.name,
      party: candidate.party,
      photo: candidate.photo,
      votes: voteMap[candidate._id.toString()] || 0,
    }));

    const totalVotes = results.reduce((acc, curr) => acc + curr.votes, 0);

    return res.json({
      success: true,
      data: {
        electionTitle: election.title,
        status: election.status,
        totalVotes,
        results,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
