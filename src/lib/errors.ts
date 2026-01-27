export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429);
  }
}

// Error response helper
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  statusCode: number;
}

export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ValidationError) {
    return {
      success: false,
      message: error.message,
      errors: error.errors,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  // Handle Mongoose validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return {
      success: false,
      message: 'Validation failed',
      statusCode: 400,
    };
  }

  // Handle Mongoose duplicate key errors
  if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
    return {
      success: false,
      message: 'A record with this value already exists',
      statusCode: 409,
    };
  }

  // Generic error
  console.error('Unhandled error:', error);
  return {
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  };
}
