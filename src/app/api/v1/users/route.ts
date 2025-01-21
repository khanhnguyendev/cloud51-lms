import dbConnect from '@/lib/db';
import { User } from '@/models/user';
import { success, HTTP_STATUS_CODES, handleError } from '@/utils/response-util';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();

    return success(HTTP_STATUS_CODES.OK, users);
  } catch (error) {
    return handleError(error);
  }
}
