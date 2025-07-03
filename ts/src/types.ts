/**
 * Configuration options for the InboxSDK client
 */
export interface InboxSDKConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the API (defaults to production) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Options for creating an email address
 */
export interface CreateEmailAddressOptions {
  /** Whether the email address should be temporary or persistent */
  type: 'temporary' | 'persistent';
  /** Custom prefix for the email address (optional) */
  prefix?: string;
  /** Domain to use (optional, uses default if not specified) */
  domain?: string;
  /** Expiration time for temporary emails in minutes (default: 60) */
  expirationMinutes?: number;
  /** Metadata to associate with the email address */
  metadata?: Record<string, any>;
}

/**
 * Represents an email address created through the SDK
 */
export interface EmailAddress {
  /** Unique identifier for the email address */
  id: string;
  /** The actual email address */
  email: string;
  /** Type of email address */
  type: 'temporary' | 'persistent';
  /** Creation timestamp */
  createdAt: Date;
  /** Expiration timestamp (null for persistent emails) */
  expiresAt: Date | null;
  /** Current status */
  status: 'active' | 'expired' | 'disabled';
  /** Associated metadata */
  metadata?: Record<string, any>;
}

/**
 * Email recipient information
 */
export interface EmailRecipient {
  /** Email address */
  email: string;
  /** Display name (optional) */
  name?: string;
}

/**
 * Email attachment information
 */
export interface EmailAttachment {
  /** Filename */
  filename: string;
  /** Content type (MIME type) */
  contentType: string;
  /** File content as base64 string or buffer */
  content: string | Buffer;
  /** Content ID for inline attachments (optional) */
  cid?: string;
}

/**
 * Options for sending an email
 */
export interface SendEmailOptions {
  /** Email address ID to send from */
  fromEmailId: string;
  /** Recipients */
  to: EmailRecipient[];
  /** CC recipients (optional) */
  cc?: EmailRecipient[];
  /** BCC recipients (optional) */
  bcc?: EmailRecipient[];
  /** Email subject */
  subject: string;
  /** Plain text content (optional if html is provided) */
  text?: string;
  /** HTML content (optional if text is provided) */
  html?: string;
  /** Email attachments (optional) */
  attachments?: EmailAttachment[];
  /** Custom headers (optional) */
  headers?: Record<string, string>;
  /** Schedule send time (optional) */
  scheduledAt?: Date;
  /** Thread ID to reply to (optional) */
  threadId?: string;
  /** Metadata to associate with the email */
  metadata?: Record<string, any>;
}

/**
 * Represents a sent email
 */
export interface SentEmail {
  /** Unique identifier for the sent email */
  id: string;
  /** Email address ID used to send */
  fromEmailId: string;
  /** Recipients */
  to: EmailRecipient[];
  /** CC recipients */
  cc?: EmailRecipient[];
  /** BCC recipients */
  bcc?: EmailRecipient[];
  /** Subject */
  subject: string;
  /** Send timestamp */
  sentAt: Date;
  /** Delivery status */
  status: 'sent' | 'delivered' | 'failed' | 'scheduled';
  /** Thread ID */
  threadId?: string;
  /** Associated metadata */
  metadata?: Record<string, any>;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  /** Response data */
  data: T;
  /** Success indicator */
  success: boolean;
  /** Error message if any */
  error?: string;
  /** Request ID for debugging */
  requestId?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Has next page */
  hasNext: boolean;
  /** Has previous page */
  hasPrevious: boolean;
}
