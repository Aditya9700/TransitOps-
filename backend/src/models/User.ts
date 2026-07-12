import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: (typeof ROLES)[number];
  comparePassword: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ROLES,
      required: [true, 'Role is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save password hashing hook
UserSchema.pre('save', async function (next) {
  const user = this as any;
  if (!user.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password helper
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const user = this as any;
  return bcrypt.compare(password, user.password || '');
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
