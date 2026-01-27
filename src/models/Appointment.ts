import mongoose, { Schema, Document, Model, HydratedDocument } from 'mongoose';
import { IAppointment, AppointmentStatus } from '@/types';

export interface IAppointmentDocument extends Omit<IAppointment, '_id'>, Document {}

const appointmentSchema = new Schema<IAppointmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required'],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Customer name must be at least 2 characters'],
      maxlength: [100, 'Customer name must be less than 100 characters'],
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes must be less than 500 characters'],
    },
    slotKey: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
appointmentSchema.index({ userId: 1, startTime: 1 });
appointmentSchema.index({ userId: 1, staffId: 1, startTime: 1 });
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ staffId: 1, startTime: 1, endTime: 1 });

// Unique index for slot key to prevent double booking
appointmentSchema.index(
  { slotKey: 1 },
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { 
      slotKey: { $exists: true, $ne: null },
      status: { $nin: ['cancelled'] }
    }
  }
);

// Generate slot key before saving
appointmentSchema.pre('save', function () {
  const doc = this as HydratedDocument<IAppointmentDocument>;
  if (doc.staffId && doc.startTime) {
    const date = doc.startTime.toISOString().split('T')[0];
    const time = doc.startTime.toISOString().split('T')[1].substring(0, 5);
    doc.slotKey = `${doc.staffId}_${date}_${time}`;
  } else {
    doc.slotKey = undefined;
  }
});

const Appointment: Model<IAppointmentDocument> =
  mongoose.models.Appointment || mongoose.model<IAppointmentDocument>('Appointment', appointmentSchema);

export default Appointment;
