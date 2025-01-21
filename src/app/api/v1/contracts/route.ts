import dbConnect from '@/lib/db';
import { Contract } from '@/models/contract';
import { HTTP_STATUS_CODES, success, handleError } from '@/utils/response-util';

export async function GET() {
  try {
    await dbConnect();
    const contracts = await Contract.find();

    return success(HTTP_STATUS_CODES.OK, contracts);
  } catch (e) {
    return handleError(e as Error);
  }
}

export async function POST(req: any) {
  try {
    await dbConnect();
    const contract = new Contract(req.body);
    await contract.save();

    return success(HTTP_STATUS_CODES.CREATED, contract);
  } catch (error) {
    return handleError(error);
  }
}
