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

    const transactions = await Transaction.find({
      paidStatus: { $ne: 'PAID_ALL' }
    })
      .populate({
        path: 'contractId',
        populate: {
          path: 'user',
          select: 'name phones'
        }
      })
      .exec();

    const response: any = {
      overdue: [],
      due: [],
      upcoming: []
    };

    transactions.forEach((transaction) => {
      const dueDate = new Date(transaction.dueDate);
      const contract = transaction.contractId;
      const user = contract?.user;

      const customerPhone = user?.phones?.[0]?.number || '';
      const contractResponse = {
        _id: contract?._id.toString(),
        contractCode: contract?.contractCode,
        contractDate: contract?.contractDate.toISOString().split('T')[0],
        customerName: user?.name || '',
        customerPhone,
        transaction: {
          _id: transaction._id.toString(),
          amount: transaction.amount,
          partialAmount: transaction.partialAmount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: transaction.paidStatus
        }
      };

      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        response.overdue.push(contractResponse);
      } else if (dueDate.getTime() === today.getTime()) {
        response.due.push(contractResponse);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        response.upcoming.push(contractResponse);
      }
    });

    return success(HTTP_STATUS_CODES.OK, response);
  } catch (error) {
    return handleError(error);
  }
}
