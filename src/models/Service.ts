import mongoose, { Schema, Document, Model } from 'mongoose';
import { IService } from '@/types';

export interface IServiceDocument extends Omit<IService, '_id'>, Document {}

const serviceSchema = new Schema<IServiceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      minlength: [2, 'Service name must be at least 2 characters'],
      maxlength: [100, 'Service name must be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be less than 500 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      max: [480, 'Duration must be less than 8 hours'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's services
serviceSchema.index({ userId: 1, name: 1 });
serviceSchema.index({ userId: 1, status: 1 });

const Service: Model<IServiceDocument> =
  mongoose.models.Service || mongoose.model<IServiceDocument>('Service', serviceSchema);

export default Service;
