import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  _id: string;
  contractDate: string;
  contractCode: string;
  contractType: 'loan' | 'lease';
  deviceType: string;
  deviceImei: string;
  totalAmount: number;
  fee: number;
  note: string;
  transactions: string[];
  user: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const ContractSchema: Schema = new mongoose.Schema(
  {
    contractDate: {
      type: Date,
      required: true
    },
    contractCode: {
      type: String,
      required: true,
      unique: true
    },
    contractType: {
      type: String,
      required: true,
      enum: ['loan', 'lease'],
      default: 'loan'
    },
    deviceType: {
      type: String,
      required: true
    },
    deviceImei: {
      type: String,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    fee: {
      type: Number,
      required: true
    },
    note: {
      type: String
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export const Contract =
  mongoose.models.Contract ||
  mongoose.model<IContract>('Contract', ContractSchema);
