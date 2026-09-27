import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    voterHash: {
      type: String,
      required: true,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log the voting timestamp
  }
);

// Create compound unique index to prevent a voter from casting multiple votes in the same election
voteSchema.index({ voterHash: 1, election: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
