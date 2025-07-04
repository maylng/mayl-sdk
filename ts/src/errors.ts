/**
 * Base class for all Mayl errors
 */
export abstract class MaylError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode?: number;

  constructor(message: string, public readonly requestId?: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Authentication related errors
 */
export class AuthenticationError extends MaylError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;

  constructor(message: string = 'Invalid API key or authentication failed', requestId?: string) {
    super(message, requestId);
  }
}

/**
 * Authorization related errors
 */
export class AuthorizationError extends MaylError {
  readonly code = 'AUTHORIZATION_ERROR';
  readonly statusCode = 403;

  constructor(message: string = 'Insufficient permissions to perform this action', requestId?: string) {
    super(message, requestId);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends MaylError {
  readonly code = 'NOT_FOUND_ERROR';
  readonly statusCode = 404;

  constructor(resource: string, id?: string, requestId?: string) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, requestId);
  }
}

/**
 * Validation errors for invalid input
 */
export class ValidationError extends MaylError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(message: string, public readonly field?: string, requestId?: string) {
    super(message, requestId);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends MaylError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;

  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number,
    requestId?: string
  ) {
    super(message, requestId);
  }
}

/**
 * Network or connection errors
 */
export class NetworkError extends MaylError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 0; // No HTTP status for network errors

  constructor(message: string = 'Network request failed', requestId?: string) {
    super(message, requestId);
  }
}

/**
 * Server errors (5xx responses)
 */
export class ServerError extends MaylError {
  readonly code = 'SERVER_ERROR';

  constructor(
    message: string = 'Internal server error',
    public readonly statusCode: number = 500,
    requestId?: string
  ) {
    super(message, requestId);
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends MaylError {
  readonly code = 'TIMEOUT_ERROR';
  readonly statusCode = 408; // Request Timeout

  constructor(message: string = 'Request timeout', requestId?: string) {
    super(message, requestId);
  }
}

/**
 * Email address related errors
 */
export class EmailAddressError extends MaylError {
  readonly code = 'EMAIL_ADDRESS_ERROR';
  readonly statusCode = 400;

  constructor(message: string, requestId?: string) {
    super(message, requestId);
  }
}

/**
 * Email sending related errors
 */
export class EmailSendError extends MaylError {
  readonly code = 'EMAIL_SEND_ERROR';
  readonly statusCode = 400;

  constructor(message: string, requestId?: string) {
    super(message, requestId);
  }
}
