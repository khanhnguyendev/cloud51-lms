import { dbConnect } from '@/lib/db';
import { Contract } from '@/models/contract';
import { Transaction } from '@/models/transaction';
import { User } from '@/models/user';
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
        'Dữ liệu không hợp lệ',
        'Expected an array of transaction updates'
      );
    }

    await dbConnect();

    const updateResults = [];
    for (const update of updates) {
      const { _id, amount, partialAmount, paidStatus } = update;

      if (!_id || amount == null || partialAmount == null || !paidStatus) {
        return errorResponse(
          HTTP_STATUS_CODES.BAD_REQUEST,
          'Dữ liệu không hợp lệ',
          `Transaction with _id ${_id} has incomplete fields`
        );
      }

      if (paidStatus === 'PAID_ALL' && partialAmount < amount) {
        return errorResponse(
          HTTP_STATUS_CODES.BAD_REQUEST,
          'Số tiền thanh toán không hợp lệ',
          `Transaction with _id ${_id} has invalid amount and partialAmount`
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
      transaction.paidDate = new Date();
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

function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getTomorrowDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const today = getTodayDate();
    const tomorrow = getTomorrowDate();

    // Fetch transactions with related contract and user data in a single query
    const transactions = await Transaction.aggregate([
      {
        $match: { paidStatus: { $ne: 'PAID_ALL' } }
      },
      {
        $lookup: {
          from: 'contracts',
          localField: 'contractId',
          foreignField: '_id',
          as: 'contract'
        }
      },
      { $unwind: '$contract' },
      // Filter contract with deletedAt is null
      {
        $match: { 'contract.deletedAt': null }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'contract.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    const response: any = {
      overdue: [],
      due: [],
      upcoming: []
    };

    // Process transactions in parallel
    await Promise.all(
      transactions.map(async (transaction) => {
        const dueDate = new Date(transaction.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const customerPhone = transaction.user?.phones?.[0]?.number || '';
        const contractResponse = {
          _id: transaction.contract._id.toString(),
          contractCode: transaction.contract?.contractCode,
          contractDate: transaction.contract?.contractDate
            .toISOString()
            .split('T')[0],
          customerName: transaction.user?.name || '',
          customerPhone,
          transaction: {
            _id: transaction._id.toString(),
            amount: transaction.amount,
            partialAmount: transaction.partialAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            status: transaction.paidStatus
          }
        };

        if (dueDate < today) {
          response.overdue.push(contractResponse);
        } else if (dueDate.getTime() === today.getTime()) {
          response.due.push(contractResponse);
        } else if (dueDate.getTime() === tomorrow.getTime()) {
          response.upcoming.push(contractResponse);
        }
      })
    );

    return success(HTTP_STATUS_CODES.OK, response);
  } catch (error) {
    return handleError(error);
  }
}
