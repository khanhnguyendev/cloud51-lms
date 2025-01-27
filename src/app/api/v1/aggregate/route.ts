import { dbConnect } from '@/lib/db';
import { Contract } from '@/models/contract';
import { Transaction } from '@/models/transaction';
import { handleError, HTTP_STATUS_CODES, success } from '@/utils/response-util';
import moment from 'moment';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const currentMonth = moment().startOf('month').toDate();
    const previousMonth = moment()
      .subtract(1, 'month')
      .startOf('month')
      .toDate();
    const nextMonth = moment().add(1, 'month').startOf('month').toDate();

    // Aggregating contracts by current and previous months
    const contractsByMonth = await Contract.aggregate([
      {
        $facet: {
          currentMonth: [
            {
              $match: { contractDate: { $gte: currentMonth, $lt: nextMonth } }
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$totalAmount' },
                totalContracts: { $sum: 1 }
              }
            }
          ],
          previousMonth: [
            {
              $match: {
                contractDate: { $gte: previousMonth, $lt: currentMonth }
              }
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$totalAmount' },
                totalContracts: { $sum: 1 }
              }
            }
          ],
          all: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$totalAmount' },
                totalContracts: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Aggregating transactions by current and previous months
    const transactionsByMonth = await Transaction.aggregate([
      {
        $facet: {
          currentMonth: [
            { $match: { paymentDate: { $gte: currentMonth, $lt: nextMonth } } },
            {
              $group: { _id: null, totalCollected: { $sum: '$partialAmount' } }
            }
          ],
          previousMonth: [
            {
              $match: {
                paymentDate: { $gte: previousMonth, $lt: currentMonth }
              }
            },
            {
              $group: { _id: null, totalCollected: { $sum: '$partialAmount' } }
            }
          ],
          all: [
            {
              $group: { _id: null, totalCollected: { $sum: '$partialAmount' } }
            }
          ]
        }
      }
    ]);

    // Aggregating currently loaned data
    const currentlyLoaned = await Transaction.aggregate([
      {
        $group: {
          _id: '$contractId',
          totalPartialAmount: { $sum: '$partialAmount' }
        }
      },
      {
        $lookup: {
          from: 'contracts',
          localField: '_id',
          foreignField: '_id',
          as: 'contractDetails'
        }
      },
      { $unwind: '$contractDetails' },
      {
        $project: {
          remainingAmount: {
            $subtract: ['$contractDetails.totalAmount', '$totalPartialAmount']
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRemaining: { $sum: '$remainingAmount' }
        }
      }
    ]);

    // Extracting data from results
    const currentContracts = contractsByMonth[0].currentMonth[0] || {
      totalAmount: 0,
      totalContracts: 0
    };
    const previousContracts = contractsByMonth[0].previousMonth[0] || {
      totalAmount: 0,
      totalContracts: 0
    };
    const allContracts = contractsByMonth[0].all[0] || {
      totalAmount: 0,
      totalContracts: 0
    };

    const currentTransactions = transactionsByMonth[0].currentMonth[0] || {
      totalCollected: 0
    };
    const previousTransactions = transactionsByMonth[0].previousMonth[0] || {
      totalCollected: 0
    };
    const allTransactions = transactionsByMonth[0].all[0] || {
      totalCollected: 0
    };

    const totalRemaining = currentlyLoaned[0]?.totalRemaining || 0;

    // Calculating percentage change
    const percentageChange = (current: number, previous: number): number =>
      previous > 0
        ? ((current - previous) / previous) * 100
        : current > 0
          ? 100
          : 0;

    // Constructing response object
    const result = {
      totalLoans: {
        current: currentContracts.totalAmount,
        previous: previousContracts.totalAmount,
        all: allContracts.totalAmount,
        change: percentageChange(
          currentContracts.totalAmount,
          previousContracts.totalAmount
        )
      },
      totalContracts: {
        current: currentContracts.totalContracts,
        previous: previousContracts.totalContracts,
        all: allContracts.totalContracts,
        change: percentageChange(
          currentContracts.totalContracts,
          previousContracts.totalContracts
        )
      },
      totalCollected: {
        current: currentTransactions.totalCollected,
        previous: previousTransactions.totalCollected,
        all: allTransactions.totalCollected,
        change: percentageChange(
          currentTransactions.totalCollected,
          previousTransactions.totalCollected
        )
      },
      currentlyLoaned: {
        current: totalRemaining,
        all: totalRemaining // Assuming "all" is the same as "current" here
      }
    };

    return success(HTTP_STATUS_CODES.OK, result);
  } catch (error) {
    return handleError(error as Error);
  }
}
