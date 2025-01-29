import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  contractId: string;
  userId: string;
  amount: number;
  partialAmount: number;
  dueDate: Date;
  paidStatus: string;
  status: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const TransactionSchema: Schema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true // The amount of money being paid
    },
    partialAmount: {
      type: Number,
      required: true, // The amount of money being paid
      default: 0
    },
    dueDate: {
      type: Date, // The date when the money should be paid
      required: true
    },
    paidDate: {
      type: Date, // The date when the money has been paid
      default: null
    },
    paidStatus: {
      type: String,
      enum: ['NOT_PAID', 'PAID_ALL', 'PARTIALLY_PAID'],
      default: 'NOT_PAID'
    },
    note: {
      type: String
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
