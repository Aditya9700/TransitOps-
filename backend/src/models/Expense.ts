import mongoose, { Document, Schema } from 'mongoose';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../utils/constants';

export interface IExpense extends Document {
  expenseCode: string;
  expenseCategory: (typeof EXPENSE_CATEGORIES)[number];
  status: (typeof EXPENSE_STATUSES)[number];
  amount: number;
  expenseDate: Date;
  description: string;
  vehicle: mongoose.Types.ObjectId;
  trip: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseCode: {
      type: String,
      required: [true, 'Expense code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    expenseCategory: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: true,
    },
    status: {
      type: String,
      enum: EXPENSE_STATUSES,
      default: 'Paid',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expenseDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
