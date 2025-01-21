import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

export function success(statusCode: number, message: any) {
  return NextResponse.json({
    statusCode,
    message,
    timestamp: new Date().toString()
  });
}

export function errorResponse(
  statusCode: number,
  error: string,
  errorDetail: string
) {
  return NextResponse.json({
    statusCode,
    error,
    errorDetail,
    timestamp: new Date().toString()
  });
}

export function handleError(error: Error | any) {
  const isProduction = process.env.NODE_ENV === 'production';
  const errorCode = uuidv4();
  const errorMessage = isProduction ? 'An error occurred' : error.message;
  const errorDetail = isProduction
    ? `An error occurred (${errorCode})`
    : error.stack || 'No stack trace available';

  // Structured log for better debugging
  console.log({
    level: 'error',
    environment: process.env.NODE_ENV || 'development',
    errorCode,
    errorMessage: error.message,
    stackTrace: isProduction ? undefined : error.stack
  });

  return errorResponse(
    HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    errorMessage,
    errorDetail
  );
}
