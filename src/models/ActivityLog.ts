import mongoose, { Schema, Document, Model } from 'mongoose';
import { IActivityLog, ActivityAction } from '@/types';

export interface IActivityLogDocument extends Omit<IActivityLog, '_id'>, Document {}

const activityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'appointment_created',
        'appointment_updated',
        'appointment_cancelled',
        'appointment_completed',
        'queue_added',
        'queue_assigned',
        'staff_created',
        'staff_updated',
        'staff_deleted',
        'service_created',
        'service_updated',
        'service_deleted',
      ] as ActivityAction[],
    },
    details: {
      type: String,
      required: [true, 'Details are required'],
      maxlength: [500, 'Details must be less than 500 characters'],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, action: 1 });

const ActivityLog: Model<IActivityLogDocument> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLogDocument>('ActivityLog', activityLogSchema);

export default ActivityLog;
