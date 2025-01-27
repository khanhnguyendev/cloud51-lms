import { dbConnect } from '@/lib/db';
import { Contract } from '@/models/contract';
import { Transaction } from '@/models/transaction';
import { handleError, HTTP_STATUS_CODES, success } from '@/utils/response-util';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Aggregating contracts without any date filtering
    const contracts = await Contract.aggregate([
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'contractId',
          as: 'transactions'
        }
      },
      {
        $project: {
          totalAmount: 1,
          fee: 1,
          transactions: 1
        }
      }
    ]);

    // Aggregating transactions without any date filtering
    const transactions = await Transaction.aggregate([
      {
        $group: {
          _id: '$contractId',
          totalCollected: { $sum: '$partialAmount' }
        }
      }
    ]);

    // Calculating the total amount, total fee, and contract statuses
    let totalLoan = 0;
    let totalContracts = { in_process: 0, completed: 0 };
    let totalCollected = 0; // Accumulating the total collected amount
    let totalFee = 0;
    let currentlyLoaned = 0;

    // Mapping transaction total collected by contractId for easy lookup
    const transactionMap = transactions.reduce((map, transaction) => {
      map[transaction._id] = transaction.totalCollected;
      return map;
    }, {});

    contracts.forEach((contract) => {
      totalLoan += contract.totalAmount;
      totalFee += contract.fee;

      const totalPaid = transactionMap[contract._id] || 0; // Get total collected for this contract

      if (totalPaid === contract.totalAmount) {
        totalContracts.completed += 1;
      } else {
        totalContracts.in_process += 1;
        currentlyLoaned += contract.totalAmount - totalPaid;
      }

      totalCollected += totalPaid; // Sum total collected for all contracts
    });

    // Constructing response object
    const result = {
      totalLoans: totalLoan,
      totalContracts: {
        in_process: totalContracts.in_process,
        completed: totalContracts.completed
      },
      totalCollected, // Updated total collected
      currentlyLoaned,
      totalFee
    };

    return success(HTTP_STATUS_CODES.OK, result);
  } catch (error) {
    return handleError(error as Error);
  }
}
