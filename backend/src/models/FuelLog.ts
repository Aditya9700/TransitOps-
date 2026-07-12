import mongoose, { Document, Schema } from 'mongoose';

export interface IFuelLog extends Document {
  fuelCode: string;
  vehicle: mongoose.Types.ObjectId;
  trip: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  date: Date;
  fuelQuantity: number;
  fuelCost: number;
  odometer: number;
  fuelStation: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    fuelCode: {
      type: String,
      required: [true, 'Fuel log code is required'],
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
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    fuelQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelCost: {
      type: Number,
      required: true,
      min: 0,
    },
    odometer: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelStation: {
      type: String,
      required: true,
      trim: true,
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

export const FuelLog = mongoose.model<IFuelLog>('FuelLog', FuelLogSchema);
export default FuelLog;
