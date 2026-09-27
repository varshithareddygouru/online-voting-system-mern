import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'voting_jwt_secret_key_2026_premium_app', {
    expiresIn: '30d',
  });
};

// @desc    Register a new voter
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, voterId, aadhaarCard, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const voterIdExists = await User.findOne({ voterId: voterId.toUpperCase() });
    if (voterIdExists) {
      return res.status(400).json({ success: false, message: 'Voter ID already registered' });
    }

    // Handle file upload path
    let profileImage = '/uploads/default-avatar.png';
    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      voterId: voterId.toUpperCase(),
      aadhaarCard,
      password,
      profileImage,
    });

    if (user) {
      // Log Activity
      await ActivityLog.create({
        user: user._id,
        userType: 'User',
        username: user.fullName,
        action: 'Voter Registration Submitted',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Awaiting admin approval.',
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          voterId: user.voterId,
          profileImage: user.profileImage,
          isApproved: user.isApproved,
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate voter & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isLocked) {
      return res.status(403).json({ success: false, message: 'Your account is locked. Contact administrator.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Log Activity
    await ActivityLog.create({
      user: user._id,
      userType: 'User',
      username: user.fullName,
      action: 'Voter Logged In',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      success: true,
      token: generateToken(user._id),
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        voterId: user.voterId,
        phone: user.phone,
        aadhaarCard: user.aadhaarCard,
        profileImage: user.profileImage,
        isApproved: user.isApproved,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      return res.json({
        success: true,
        data: user,
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await user.save();

      // Log Activity
      await ActivityLog.create({
        user: user._id,
        userType: 'User',
        username: user.fullName,
        action: 'Voter Profile Updated',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          voterId: updatedUser.voterId,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage,
          isApproved: updatedUser.isApproved,
          role: updatedUser.role,
        },
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
