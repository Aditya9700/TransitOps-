import mongoose, { Schema, Document } from 'mongoose';
import { VEHICLE_STATUSES, VEHICLE_TYPES } from '../utils/constants';

export interface IVehicle extends Document {
  registrationNumber: string;
  name: string; // matches frontend 'name' which holds description/make
  type: (typeof VEHICLE_TYPES)[number];
  capacity: number;
  capacityUnit: 'kg' | 'Ton';
  odometer: number;
  acquisitionCost: number;
  status: (typeof VEHICLE_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema: Schema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration Number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Vehicle model/name description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: VEHICLE_TYPES,
      required: [true, 'Vehicle type is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity value is required'],
      min: [0, 'Capacity cannot be negative'],
    },
    capacityUnit: {
      type: String,
      enum: ['kg', 'Ton'],
      default: 'kg',
    },
    odometer: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Odometer cannot be negative'],
    },
    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition Cost is required'],
      min: [0, 'Acquisition Cost cannot be negative'],
    },
    status: {
      type: String,
      enum: VEHICLE_STATUSES,
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
export default Vehicle;
