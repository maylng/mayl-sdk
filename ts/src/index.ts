// Main exports
export { InboxSDK, createInboxSDK } from './inbox-sdk';

// Type exports
export type {
  InboxSDKConfig,
  CreateEmailAddressOptions,
  EmailAddress,
  EmailRecipient,
  EmailAttachment,
  SendEmailOptions,
  SentEmail,
  APIResponse,
  PaginationOptions,
  PaginatedResponse
} from './types';

// Error exports
export {
  InboxSDKError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ServerError,
  TimeoutError,
  EmailAddressError,
  EmailSendError
} from './errors';

// Service exports (for advanced usage)
export { EmailAddressService } from './email-address-service';
export { EmailService } from './email-service';
export { HTTPClient } from './http-client';
