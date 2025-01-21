import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  contractId: string;
  userId: string;
  amount: number;
  partialAmount: number;
  paymentDate: Date;
  paidStatus: string;
  status: string;
  note: string;
}

const TransactionSchema: Schema = new mongoose.Schema({
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
  paymentDate: {
    type: Date,
    required: true // The date when the payment was made
  },
  paidStatus: {
    type: String,
    enum: ['NOT_PAID', 'PAID_ALL', 'PARTIALLY_PAID'],
    default: 'NOT_PAID'
  },
  status: {
    type: String,
    enum: [
      'NEW',
      'PENDING',
      'PAID_ON_TIME',
      'PAID_LATE',
      'OVERDUE',
      'PARTIALLY_PAID',
      'CANCELLED'
    ],
    default: 'NEW'
  },
  note: {
    type: String
  }
});

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
