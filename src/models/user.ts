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
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'guest'],
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
    }
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
