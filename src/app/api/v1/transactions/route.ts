import { dbConnect } from '@/lib/db';
import { Transaction } from '@/models/transaction';
import {
  success,
  HTTP_STATUS_CODES,
  handleError,
  errorResponse
} from '@/utils/response-util';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();

    if (!Array.isArray(updates)) {
      return errorResponse(
        HTTP_STATUS_CODES.BAD_REQUEST,
        'Invalid data format',
        'Expected an array of transaction updates'
      );
    }

    await dbConnect();

    const updateResults = [];
    for (const update of updates) {
      const { _id, amount, partialAmount, paymentDate, paidStatus } = update;

      if (
        !_id ||
        amount == null ||
        partialAmount == null ||
        !paymentDate ||
        !paidStatus
      ) {
        return errorResponse(
          HTTP_STATUS_CODES.BAD_REQUEST,
          'Dữ liệu không hợp lệ',
          `Transaction with _id ${_id} has incomplete fields`
        );
      }

      if (amount < 0 || partialAmount < 0 || partialAmount > amount) {
        return errorResponse(
          HTTP_STATUS_CODES.BAD_REQUEST,
          'Số tiền thanh toán không hợp lệ',
          `Transaction with _id ${_id} has invalid amount or partialAmount`
        );
      }

      const transaction = await Transaction.findById(_id);
      if (!transaction) {
        return errorResponse(
          HTTP_STATUS_CODES.NOT_FOUND,
          'Transaction not found',
          `Transaction with _id ${_id} does not exist`
        );
      }

      console.log(`Updating transaction`, transaction);

      transaction.amount = amount;
      transaction.partialAmount = partialAmount;
      transaction.paymentDate = new Date(paymentDate);
      transaction.paidStatus = paidStatus;
      transaction.updatedAt = new Date();

      await transaction.save();
      updateResults.push(transaction);
    }

    return success(HTTP_STATUS_CODES.OK, {
      message: 'Transactions updated successfully',
      transactions: updateResults
    });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const transactions = {
      overdue: [
        {
          _id: '1',
          contractDate: '2024-12-01',
          customerName: 'John Doe',
          customerPhone: '0123456789',
          transaction: {
            _id: 't1',
            amount: 200000,
            dueDate: '2025-01-15',
            status: 'overdue'
          }
        },
        {
          _id: '2',
          contractDate: '2024-12-05',
          customerName: 'Jane Smith',
          customerPhone: '0987654321',
          transaction: {
            _id: 't2',
            amount: 350000,
            dueDate: '2025-01-20',
            status: 'overdue'
          }
        }
      ],
      due: [
        {
          _id: '3',
          contractDate: '2025-01-01',
          customerName: 'Alice Brown',
          customerPhone: '0111222333',
          transaction: {
            _id: 't3',
            amount: 150000,
            dueDate: '2025-02-01',
            status: 'due'
          }
        }
      ],
      upcoming: [
        {
          _id: '4',
          contractDate: '2025-01-10',
          customerName: 'Bob White',
          customerPhone: '0222333444',
          transaction: {
            _id: 't4',
            amount: 500000,
            dueDate: '2025-03-10',
            status: 'upcoming'
          }
        }
      ]
    };

    return success(HTTP_STATUS_CODES.OK, transactions);
  } catch (error) {
    return handleError(error);
  }
}
