import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Candidate from '../models/Candidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper to calculate age
const calculateAge = (dobString) => {
  if (!dobString) return 0;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// 1. Voter Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body; // username is the email
    if (!username || !password) {
      return res.json({ success: false, message: 'Please provide email and password' });
    }

    const voter = await User.findOne({ email: username.toLowerCase() });
    if (!voter) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, voter.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    // Map _id to id to match frontend expectation
    const voterObject = {
      ...voter.toObject(),
      id: voter._id.toString()
    };

    return res.json({ success: true, voterObject });
  } catch (error) {
    console.error('Voter login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Admin Login
router.post('/adminlogin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ success: false, message: 'Please provide username/email and password' });
    }

    // Find admin in Admin collection or in User collection with role === 'admin'
    let admin = await Admin.findOne({ 
      $or: [{ email: username.toLowerCase() }, { username: username }] 
    });

    if (!admin) {
      // Fallback: check if they are in User collection with role 'admin'
      const userAdmin = await User.findOne({ email: username.toLowerCase(), role: 'admin' });
      if (userAdmin) {
        admin = userAdmin;
      }
    }

    if (!admin) {
      return res.json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    const adminObject = {
      ...admin.toObject(),
      id: admin._id.toString()
    };

    return res.json({ success: true, adminObject });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Voter Registration
router.post('/createVoter', upload.single('image'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, state, city, dob } = req.body;
    const voterId = req.body.voterId || req.body.voterid;
    const pass = req.body.pass || req.body.password;
    
    // Check if voter already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    const existingVoterId = await User.findOne({ voterId: voterId });
    
    if (existingEmail || existingVoterId) {
      return res.json({ success: false, message: 'Voter already registered with this Email or Voter ID' });
    }

    const age = calculateAge(dob);

    let imagePath = '/uploads/default-avatar.png';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newVoter = new User({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      voterId,
      password: pass, // will be hashed by pre-save hook
      state,
      city,
      dob,
      age,
      image: imagePath,
      profileImage: imagePath,
      voteStatus: false,
      role: 'voter'
    });

    await newVoter.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Create voter error:', error);
    return res.json({ success: false, message: error.message });
  }
});

// 4. Get Voter By ID
router.get('/getVoterbyID/:id', async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }
    
    const voterObject = {
      ...voter.toObject(),
      id: voter._id.toString()
    };

    return res.json({ success: true, voter: voterObject });
  } catch (error) {
    console.error('Get voter by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 5. Get All Voters
router.get('/getVoter', async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' });
    const mappedVoters = voters.map(v => ({
      ...v.toObject(),
      id: v._id.toString()
    }));
    return res.json({ success: true, voter: mappedVoters });
  } catch (error) {
    console.error('Get voters error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. Delete Voter
router.delete('/deleteVoter/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete voter error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 7. Get All Candidates
router.get('/getCandidate', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    // Map photo/image and biography/bio fields to guarantee frontend reading works
    const mappedCandidates = candidates.map(c => ({
      ...c.toObject(),
      id: c._id.toString(),
      image: c.image || c.photo,
      photo: c.photo || c.image,
      biography: c.biography || c.bio,
      bio: c.bio || c.biography
    }));
    return res.json({ success: true, candidate: mappedCandidates });
  } catch (error) {
    console.error('Get candidates error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 8. Create Candidate
router.post('/createCandidate', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'symbol', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fullName, age, party, bio } = req.body;

    let imagePath = '/uploads/default-candidate.png';
    let symbolPath = '/uploads/default-symbol.png';

    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        imagePath = `/uploads/${req.files['image'][0].filename}`;
      }
      if (req.files['symbol'] && req.files['symbol'][0]) {
        symbolPath = `/uploads/${req.files['symbol'][0].filename}`;
      }
    }

    const newCandidate = new Candidate({
      name: fullName,
      fullName,
      age: age ? parseInt(age) : 0,
      party,
      biography: bio,
      bio,
      photo: imagePath,
      image: imagePath,
      symbol: symbolPath,
      votes: 0
    });

    await newCandidate.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Create candidate error:', error);
    return res.json({ success: false, message: error.message });
  }
});

// 9. Increment Candidate Vote Count (Vote casting)
router.patch('/getCandidate/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    candidate.votes = (candidate.votes || 0) + 1;
    await candidate.save();

    return res.json({ success: true, votes: candidate.votes });
  } catch (error) {
    console.error('Vote increment error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 10. Update Voter Profile / Mark as Voted
router.patch('/updateVoter/:id', async (req, res) => {
  try {
    const { voteStatus } = req.body;
    const voter = await User.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    if (voteStatus !== undefined) {
      voter.voteStatus = voteStatus;
    }
    
    // Save any other profile modifications sent
    if (req.body.firstName) voter.firstName = req.body.firstName;
    if (req.body.lastName) voter.lastName = req.body.lastName;
    if (req.body.phone) voter.phone = req.body.phone;

    await voter.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Update voter error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 11. Delete Candidate
router.delete('/deleteCandidate/:id', async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete candidate error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 12. Get Dashboard Data
router.get('/getDashboardData', async (req, res) => {
  try {
    const voterCount = await User.countDocuments({ role: 'voter' });
    const candidateCount = await Candidate.countDocuments();
    const votersVoted = await User.countDocuments({ role: 'voter', voteStatus: true });

    return res.json({
      success: true,
      DashboardData: {
        voterCount,
        candidateCount,
        votersVoted
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 13. Logout
router.post('/logout', (req, res) => {
  return res.json({ success: true });
});

export default router;
