import { success, HTTP_STATUS_CODES, handleError } from '@/utils/response-util';

export async function POST(req: Request) {
  try {
    const request = await req.json();
    console.log('Update transactions request::', request);
    return success(HTTP_STATUS_CODES.OK, request);
  } catch (error) {
    return handleError(error);
  }
}
