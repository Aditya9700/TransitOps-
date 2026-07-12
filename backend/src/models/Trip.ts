import mongoose, { Document, Schema } from 'mongoose';
import { TRIP_STATUSES } from '../utils/constants';

export interface ITrip extends Document {
  tripCode: string;
  vehicle: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  expectedRevenue: number;
  status: (typeof TRIP_STATUSES)[number];
  notes?: string;
  eta?: string;
  createdDate: Date;
  dispatchedDate?: Date | null;
  completedDate?: Date | null;
  cancelledDate?: Date | null;
  finalOdometer?: number;
  fuelConsumed?: number;
  additionalExpense?: number;
  completionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    tripCode: {
      type: String,
      required: [true, 'Trip code is required'],
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
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    cargoWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    plannedDistance: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedRevenue: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: TRIP_STATUSES,
      default: 'Draft',
    },
    notes: {
      type: String,
      trim: true,
    },
    eta: {
      type: String,
      trim: true,
    },
    createdDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    dispatchedDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    cancelledDate: {
      type: Date,
      default: null,
    },
    finalOdometer: {
      type: Number,
      min: 0,
    },
    fuelConsumed: {
      type: Number,
      min: 0,
    },
    additionalExpense: {
      type: Number,
      min: 0,
    },
    completionNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model<ITrip>('Trip', TripSchema);
export default Trip;
