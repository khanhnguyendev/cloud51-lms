import { CustomError } from './CustomError';

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message, 403); // HTTP 403 - Forbidden
  }
}
