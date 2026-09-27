import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Create a new election
// @route   POST /api/elections
// @access  Private/Admin
export const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      creator: req.admin._id,
    });

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Created Election: ${title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({ success: true, data: election });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public
export const getElections = async (req, res) => {
  try {
    // Populate candidates details
    const elections = await Election.find().populate('candidates').sort('-createdAt');
    return res.json({ success: true, data: elections });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single election by ID
// @route   GET /api/elections/:id
// @access  Public
export const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('candidates');
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    return res.json({ success: true, data: election });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update election
// @route   PUT /api/elections/:id
// @access  Private/Admin
export const updateElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body;

    let election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    election.title = title || election.title;
    election.description = description || election.description;
    election.startDate = startDate || election.startDate;
    election.endDate = endDate || election.endDate;
    election.status = status || election.status;

    const updatedElection = await election.save();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Updated Election ID: ${election._id} (${election.title})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ success: true, data: updatedElection });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
export const deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Delete associated candidates
    await Candidate.deleteMany({ election: req.params.id });
    
    // Delete election
    await election.deleteOne();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Deleted Election: ${election.title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ success: true, message: 'Election and its candidates removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add candidate to an election
// @route   POST /api/elections/:id/candidates
// @access  Private/Admin
export const addCandidate = async (req, res) => {
  try {
    const { name, party, biography } = req.body;
    const electionId = req.params.id;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    let photo = '/uploads/default-candidate.png';
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }

    const candidate = await Candidate.create({
      name,
      party,
      biography,
      photo,
      election: electionId,
    });

    // Link candidate to election
    election.candidates.push(candidate._id);
    await election.save();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Added Candidate ${name} to Election: ${election.title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update candidate details
// @route   PUT /api/candidates/:id
// @access  Private/Admin
export const updateCandidate = async (req, res) => {
  try {
    const { name, party, biography } = req.body;

    let candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    candidate.name = name || candidate.name;
    candidate.party = party || candidate.party;
    candidate.biography = biography || candidate.biography;

    if (req.file) {
      candidate.photo = `/uploads/${req.file.filename}`;
    }

    const updatedCandidate = await candidate.save();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Updated Candidate: ${candidate.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ success: true, data: updatedCandidate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Remove candidate from the election's candidate array
    await Election.findByIdAndUpdate(candidate.election, {
      $pull: { candidates: candidate._id },
    });

    // Delete candidate profile
    await candidate.deleteOne();

    // Log Activity
    await ActivityLog.create({
      user: req.admin._id,
      userType: 'Admin',
      username: req.admin.username,
      action: `Deleted Candidate: ${candidate.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
