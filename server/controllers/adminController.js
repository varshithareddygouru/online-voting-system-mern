import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import Vote from '../models/Vote.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'voting_jwt_secret_key_2026_premium_app', {
    expiresIn: '7d',
  });
};

// @desc    Register a new Admin (Initial setup / Super Admin)
// @route   POST /api/admin/register
// @access  Public
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Admin email already exists' });
    }

    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const admin = await Admin.create({
      username,
      email,
      password,
      role: role || 'admin',
    });

    if (admin) {
      // Log activity
      await ActivityLog.create({
        user: admin._id,
        userType: 'Admin',
        username: admin.username,
        action: `Registered new Admin account (${admin.role})`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.status(201).json({
        success: true,
        data: {
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid admin data' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Log Activity
    await ActivityLog.create({
      user: admin._id,
      userType: 'Admin',
      username: admin.username,
      action: 'Admin Logged In',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      success: true,
      token: generateToken(admin._id),
      data: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered voters (for admin panel)
// @route   GET /api/admin/voters
// @access  Private/Admin
export const getVoters = async (req, res) => {
  try {
    const voters = await User.find().sort('-createdAt');
    return res.json({ success: true, data: voters });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve voter registration
// @route   PUT /api/admin/voters/:id/approve
// @access  Private/Admin
export const approveVoter = async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    voter.isApproved = true;
    await voter.save();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Approved voter: ${voter.fullName} (${voter.voterId})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ success: true, message: 'Voter registration approved', data: voter });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject/Delete voter registration
// @route   DELETE /api/admin/voters/:id
// @access  Private/Admin
export const rejectVoter = async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    await voter.deleteOne();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Rejected and deleted voter registration: ${voter.fullName} (${voter.voterId})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ success: true, message: 'Voter registration rejected and profile deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle lock/unlock voter account
// @route   PUT /api/admin/voters/:id/lock
// @access  Private/Admin
export const toggleLockVoter = async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    voter.isLocked = !voter.isLocked;
    await voter.save();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `${voter.isLocked ? 'Locked' : 'Unlocked'} voter account: ${voter.fullName} (${voter.voterId})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      success: true,
      message: `Voter account successfully ${voter.isLocked ? 'locked' : 'unlocked'}`,
      data: voter,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics & analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalVoters = await User.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    const totalVotes = await Vote.countDocuments();

    // Calculate Voter Turnout (Voted vs Total Approved Voters)
    const approvedVotersCount = await User.countDocuments({ isApproved: true });
    const turnoutPercentage = approvedVotersCount > 0 
      ? ((totalVotes / approvedVotersCount) * 100).toFixed(2) 
      : 0;

    // Get live elections results breakdown for top charts
    const electionsList = await Election.find({ status: 'active' }).populate('candidates');
    
    const liveStats = await Promise.all(
      electionsList.map(async (el) => {
        const votesGroup = await Vote.aggregate([
          { $match: { election: el._id } },
          { $group: { _id: '$candidate', count: { $sum: 1 } } },
        ]);

        const voteMap = {};
        votesGroup.forEach((v) => {
          voteMap[v._id.toString()] = v.count;
        });

        const breakdown = el.candidates.map((cand) => ({
          candidateName: cand.name,
          partyName: cand.party,
          voteCount: voteMap[cand._id.toString()] || 0,
        }));

        return {
          electionTitle: el.title,
          candidatesData: breakdown,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        totalVoters,
        approvedVotersCount,
        totalCandidates,
        activeElections,
        totalVotes,
        turnoutPercentage,
        liveStats,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get audit activities log list
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort('-createdAt').limit(200);
    return res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
