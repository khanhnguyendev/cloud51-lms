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

function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of the day
  return today;
}

function getTomorrowDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to start of the day
  return tomorrow;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // Connect to MongoDB

    const today = getTodayDate();
    const tomorrow = getTomorrowDate();

    // Fetch transactions that are not fully paid
    const transactions = await Transaction.find({
      paidStatus: { $ne: 'PAID_ALL' } // Only include transactions that are not fully paid
    })
      .populate({
        path: 'contractId',
        populate: {
          path: 'user',
          select: 'name phones' // Only select name and phones fields from the User model
        }
      })
      .exec();

    const response: any = {
      overdue: [],
      due: [],
      upcoming: []
    };

    transactions.forEach((transaction) => {
      const paymentDate = new Date(transaction.paymentDate);
      const contract = transaction.contractId;
      const user = contract?.user;

      const customerPhone = user?.phones?.[0]?.number || '';
      const contractResponse = {
        _id: contract?._id.toString(),
        contractDate: contract?.contractDate.toISOString().split('T')[0],
        customerName: user?.name || '',
        customerPhone,
        transaction: {
          _id: transaction._id.toString(),
          amount: transaction.amount,
          partialAmount: transaction.partialAmount,
          dueDate: paymentDate.toISOString().split('T')[0],
          status: transaction.paidStatus
        }
      };

      if (paymentDate < today) {
        response.overdue.push(contractResponse);
      } else if (
        paymentDate.toISOString().split('T')[0] ===
        today.toISOString().split('T')[0]
      ) {
        response.due.push(contractResponse);
      } else if (
        paymentDate.toISOString().split('T')[0] ===
        tomorrow.toISOString().split('T')[0]
      ) {
        response.upcoming.push(contractResponse);
      }
    });

    return success(HTTP_STATUS_CODES.OK, response);
  } catch (error) {
    return handleError(error);
  }
}
