import { dbConnect } from '@/lib/db';
import { Contract } from '@/models/contract';
import {
  errorResponse,
  handleError,
  HTTP_STATUS_CODES,
  success
} from '@/utils/response-util';

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
