import mongoose, { Document, Schema } from 'mongoose';
import { DRIVER_CATEGORIES, DRIVER_STATUSES } from '../utils/constants';

export interface IDriver extends Document {
  name: string;
  licenseNumber: string;
  category: (typeof DRIVER_CATEGORIES)[number];
  licenseExpiry: Date;
  contactNumber: string;
  email: string;
  tripCompletionRate: number;
  safetyScore: number;
  status: (typeof DRIVER_STATUSES)[number];
  assignedVehicle?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: DRIVER_CATEGORIES,
      default: 'LMV',
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Driver contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Driver email is required'],
      lowercase: true,
      trim: true,
      unique: true,
    },
    tripCompletionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    safetyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: DRIVER_STATUSES,
      default: 'Available',
    },
    assignedVehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema);
export default Driver;
