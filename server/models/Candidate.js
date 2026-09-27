import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
    },
    party: {
      type: String,
      required: [true, 'Please add a political party or organization name'],
      trim: true,
    },
    biography: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    symbol: {
      type: String,
      default: '',
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
