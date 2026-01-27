import mongoose, { Schema, Document, Model } from 'mongoose';
import { IWaitingQueue, QueueStatus } from '@/types';

export interface IWaitingQueueDocument extends Omit<IWaitingQueue, '_id'>, Document {}

const waitingQueueSchema = new Schema<IWaitingQueueDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true,
    },
    position: {
      type: Number,
      required: [true, 'Position is required'],
      min: [1, 'Position must be at least 1'],
    },
    status: {
      type: String,
      enum: ['waiting', 'assigned'] as QueueStatus[],
      default: 'waiting',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
waitingQueueSchema.index({ userId: 1, status: 1 });
waitingQueueSchema.index({ userId: 1, position: 1 });
waitingQueueSchema.index({ userId: 1, status: 1, createdAt: 1 });

const WaitingQueue: Model<IWaitingQueueDocument> =
  mongoose.models.WaitingQueue || mongoose.model<IWaitingQueueDocument>('WaitingQueue', waitingQueueSchema);

export default WaitingQueue;
