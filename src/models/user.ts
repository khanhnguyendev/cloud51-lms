import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  phones: [
    {
      number: string;
      isZalo: boolean;
    }
  ];
  address: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const UserSchema: Schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20
    },
    name: {
      type: String,
      required: true
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'guest', 'client', 'vip'],
      default: 'guest'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    phones: [
      {
        number: {
          type: String,
          required: true
        },
        isZalo: {
          type: Boolean,
          default: false
        }
      }
    ],
    address: {
      type: String
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
