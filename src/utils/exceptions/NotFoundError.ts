import { CustomError } from './CustomError';

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404); // HTTP 404 - Not Found
  }
}
