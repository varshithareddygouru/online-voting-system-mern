import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
    },
    voterId: {
      type: String,
      required: [true, 'Please add a Voter ID'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [3, 'Password must be at least 3 characters'],
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    age: {
      type: Number,
    },
    image: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    voteStatus: {
      type: Boolean,
      default: false,
    },
    role: {
  type: String,
  enum: ['voter', 'admin'],
  default: 'voter',
},

isApproved: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  }
);

// Encrypt password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare user password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
