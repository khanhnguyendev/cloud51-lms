import { dbConnect } from '@/lib/db';
import { User } from '@/models/user';
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
    const id = (await params).id;

    await dbConnect();
    const user = await User.findById(id);

    if (!user) {
      return errorResponse(
        HTTP_STATUS_CODES.NOT_FOUND,
        'User not found',
        `User with id ${id} not found`
      );
    }

    return success(HTTP_STATUS_CODES.OK, user);
  } catch (error) {
    return handleError(error);
  }
}
