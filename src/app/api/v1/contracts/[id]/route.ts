import { dbConnect } from '@/lib/db';
import { Contract } from '@/models/contract';
import { Transaction } from '@/models/transaction';
import {
  errorResponse,
  handleError,
  HTTP_STATUS_CODES,
  success
} from '@/utils/response-util';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractId = (await params).id;

    await dbConnect();
    const contract = await Contract.findById(contractId)
      .populate('transactions')
      .populate('user');

    if (!contract) {
      return errorResponse(
        HTTP_STATUS_CODES.NOT_FOUND,
        'Contract not found',
        `Contract with id ${contractId} not found`
      );
    }

    return success(HTTP_STATUS_CODES.OK, contract);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const path = req.nextUrl.searchParams.get('path');
    const contractId = (await params).id;

    console.log(`Deleting contract with id: ${contractId}...`);

    await dbConnect();

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return errorResponse(
        HTTP_STATUS_CODES.NOT_FOUND,
        'Contract not found',
        `Contract with id ${contractId} not found`
      );
    }

    // Delete all related transactions.
    await Transaction.updateMany(
      { contract: contractId },
      { $set: { deletedAt: new Date() } }
    );

    // Delete the contract
    contract.deletedAt = new Date();
    await contract.save();

    console.log(`Deleted contract with id: ${contractId} successfully`);

    revalidatePath('/');

    return success(HTTP_STATUS_CODES.OK, contract);
  } catch (error) {
    return handleError(error);
  }
}
