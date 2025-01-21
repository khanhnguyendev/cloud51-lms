import dbConnect from '@/lib/db';
import { Contract } from '@/models/contract';
import { Transaction } from '@/models/transaction';
import {
  errorResponse,
  HTTP_STATUS_CODES,
  success,
  handleError
} from '@/utils/response-util';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    await dbConnect();
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return errorResponse(
        HTTP_STATUS_CODES.NOT_FOUND,
        'Transaction not found',
        `Transaction with id ${id} not found`
      );
    }

    return success(HTTP_STATUS_CODES.OK, transaction);
  } catch (e) {
    return handleError(e);
  }
}
