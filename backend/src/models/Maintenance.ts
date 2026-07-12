import mongoose, { Document, Schema } from 'mongoose';
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from '../utils/constants';

export interface IMaintenance extends Document {
  maintenanceCode: string;
  vehicle: mongoose.Types.ObjectId;
  serviceType: string;
  description: string;
  category: (typeof MAINTENANCE_CATEGORIES)[number];
  status: (typeof MAINTENANCE_STATUSES)[number];
  scheduledDate: Date;
  estimatedCompletion?: Date | null;
  completionDate?: Date | null;
  estimatedCost: number;
  mechanicName: string;
  priority: (typeof MAINTENANCE_PRIORITIES)[number];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    maintenanceCode: {
      type: String,
      required: [true, 'Maintenance code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Maintenance description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: MAINTENANCE_CATEGORIES,
      required: [true, 'Maintenance category is required'],
    },
    status: {
      type: String,
      enum: MAINTENANCE_STATUSES,
      default: 'Scheduled',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    estimatedCompletion: {
      type: Date,
      default: null,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    mechanicName: {
      type: String,
      required: [true, 'Mechanic name is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: MAINTENANCE_PRIORITIES,
      default: 'Medium',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Maintenance = mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
export default Maintenance;
