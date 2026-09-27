import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Can be null for unauthenticated events (e.g. failed login attempts)
    },
    userType: {
      type: String,
      enum: ['User', 'Admin', 'Guest'],
      default: 'Guest',
    },
    username: {
      type: String,
      default: 'Anonymous',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log the creation time of the event
  }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
