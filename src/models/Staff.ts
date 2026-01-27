import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IStaff, StaffStatus } from '@/types';

export interface IStaffDocument extends Omit<IStaff, '_id'>, Document {}

const staffSchema = new Schema<IStaffDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be less than 100 characters'],
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
      minlength: [2, 'Service type must be at least 2 characters'],
      maxlength: [100, 'Service type must be less than 100 characters'],
    },
    dailyCapacity: {
      type: Number,
      required: [true, 'Daily capacity is required'],
      min: [1, 'Daily capacity must be at least 1'],
      max: [50, 'Daily capacity cannot exceed 50'],
      default: 5,
    },
    status: {
      type: String,
      enum: ['available', 'on_leave'] as StaffStatus[],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's staff
staffSchema.index({ userId: 1, name: 1 });
staffSchema.index({ userId: 1, serviceType: 1 });

const Staff: Model<IStaffDocument> =
  mongoose.models.Staff || mongoose.model<IStaffDocument>('Staff', staffSchema);

export default Staff;
