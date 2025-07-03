import { HTTPClient } from './http-client';
import {
  SendEmailOptions,
  SentEmail,
  EmailRecipient,
  EmailAttachment,
  PaginationOptions,
  PaginatedResponse
} from './types';
import { ValidationError, EmailSendError } from './errors';

/**
 * Service for sending emails
 */
export class EmailService {
  constructor(private httpClient: HTTPClient) {}

  /**
   * Send an email
   */
  async send(options: SendEmailOptions): Promise<SentEmail> {
    this.validateSendOptions(options);

    const requestBody = {
      fromEmailId: options.fromEmailId,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments?.map(this.processAttachment),
      headers: options.headers,
      scheduledAt: options.scheduledAt?.toISOString(),
      threadId: options.threadId,
      metadata: options.metadata
    };

    const response = await this.httpClient.post<SentEmail>('/emails/send', requestBody);

    if (!response.success) {
      throw new EmailSendError(response.error || 'Failed to send email');
    }

    return this.parseSentEmail(response.data);
  }

  /**
   * Get a sent email by ID
   */
  async get(id: string): Promise<SentEmail> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email ID is required');
    }

    const response = await this.httpClient.get<SentEmail>(`/emails/${id}`);

    if (!response.success) {
      throw new EmailSendError(response.error || 'Failed to get email');
    }

    return this.parseSentEmail(response.data);
  }

  /**
   * List sent emails with pagination and filters
   */
  async list(options?: {
    fromEmailId?: string;
    status?: 'sent' | 'delivered' | 'failed' | 'scheduled';
    threadId?: string;
    since?: Date;
    until?: Date;
    pagination?: PaginationOptions;
  }): Promise<PaginatedResponse<SentEmail>> {
    const params = new URLSearchParams();

    if (options?.fromEmailId) {
      params.append('fromEmailId', options.fromEmailId);
    }

    if (options?.status) {
      params.append('status', options.status);
    }

    if (options?.threadId) {
      params.append('threadId', options.threadId);
    }

    if (options?.since) {
      params.append('since', options.since.toISOString());
    }

    if (options?.until) {
      params.append('until', options.until.toISOString());
    }

    if (options?.pagination?.page) {
      params.append('page', options.pagination.page.toString());
    }

    if (options?.pagination?.limit) {
      params.append('limit', options.pagination.limit.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/emails?${queryString}` : '/emails';

    const response = await this.httpClient.get<PaginatedResponse<SentEmail>>(endpoint);

    if (!response.success) {
      throw new EmailSendError(response.error || 'Failed to list emails');
    }

    return {
      ...response.data,
      items: response.data.items.map(item => this.parseSentEmail(item))
    };
  }

  /**
   * Cancel a scheduled email
   */
  async cancel(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email ID is required');
    }

    const response = await this.httpClient.post(`/emails/${id}/cancel`);

    if (!response.success) {
      throw new EmailSendError(response.error || 'Failed to cancel email');
    }
  }

  /**
   * Resend a failed email
   */
  async resend(id: string): Promise<SentEmail> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email ID is required');
    }

    const response = await this.httpClient.post<SentEmail>(`/emails/${id}/resend`);

    if (!response.success) {
      throw new EmailSendError(response.error || 'Failed to resend email');
    }

    return this.parseSentEmail(response.data);
  }

  /**
   * Get email delivery status and analytics
   */
  async getDeliveryStatus(id: string): Promise<{
    status: 'sent' | 'delivered' | 'failed' | 'scheduled';
    deliveredAt?: Date;
    failureReason?: string;
    bounceType?: string;
    opens?: number;
    clicks?: number;
    lastOpenedAt?: Date;
    lastClickedAt?: Date;
  }> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email ID is required');
    }

    const response = await this.httpClient.get(`/emails/${id}/status`);

    if (!response.success) {
      throw new EmailSendError(response.error || 'Failed to get delivery status');
    }

    const data = response.data as any;
    return {
      status: data.status,
      deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
      failureReason: data.failureReason,
      bounceType: data.bounceType,
      opens: data.opens,
      clicks: data.clicks,
      lastOpenedAt: data.lastOpenedAt ? new Date(data.lastOpenedAt) : undefined,
      lastClickedAt: data.lastClickedAt ? new Date(data.lastClickedAt) : undefined
    };
  }

  /**
   * Validate send email options
   */
  private validateSendOptions(options: SendEmailOptions): void {
    if (!options || typeof options !== 'object') {
      throw new ValidationError('Options object is required');
    }

    if (!options.fromEmailId || typeof options.fromEmailId !== 'string') {
      throw new ValidationError('From email ID is required');
    }

    if (!options.to || !Array.isArray(options.to) || options.to.length === 0) {
      throw new ValidationError('At least one recipient is required');
    }

    options.to.forEach((recipient, index) => {
      this.validateEmailRecipient(recipient, `to[${index}]`);
    });

    if (options.cc) {
      options.cc.forEach((recipient, index) => {
        this.validateEmailRecipient(recipient, `cc[${index}]`);
      });
    }

    if (options.bcc) {
      options.bcc.forEach((recipient, index) => {
        this.validateEmailRecipient(recipient, `bcc[${index}]`);
      });
    }

    if (!options.subject || typeof options.subject !== 'string' || options.subject.trim() === '') {
      throw new ValidationError('Subject is required');
    }

    if (!options.text && !options.html) {
      throw new ValidationError('Either text or HTML content is required');
    }

    if (options.text && typeof options.text !== 'string') {
      throw new ValidationError('Text content must be a string');
    }

    if (options.html && typeof options.html !== 'string') {
      throw new ValidationError('HTML content must be a string');
    }

    if (options.attachments) {
      if (!Array.isArray(options.attachments)) {
        throw new ValidationError('Attachments must be an array');
      }

      options.attachments.forEach((attachment, index) => {
        this.validateEmailAttachment(attachment, `attachments[${index}]`);
      });
    }

    if (options.scheduledAt && !(options.scheduledAt instanceof Date)) {
      throw new ValidationError('Scheduled at must be a Date object');
    }

    if (options.scheduledAt && options.scheduledAt <= new Date()) {
      throw new ValidationError('Scheduled time must be in the future');
    }

    if (options.threadId && typeof options.threadId !== 'string') {
      throw new ValidationError('Thread ID must be a string');
    }

    if (options.metadata && typeof options.metadata !== 'object') {
      throw new ValidationError('Metadata must be an object');
    }
  }

  /**
   * Validate email recipient
   */
  private validateEmailRecipient(recipient: EmailRecipient, field: string): void {
    if (!recipient || typeof recipient !== 'object') {
      throw new ValidationError(`${field} must be an object`);
    }

    if (!recipient.email || typeof recipient.email !== 'string') {
      throw new ValidationError(`${field}.email is required`);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient.email)) {
      throw new ValidationError(`${field}.email is not a valid email address`);
    }

    if (recipient.name && typeof recipient.name !== 'string') {
      throw new ValidationError(`${field}.name must be a string`);
    }
  }

  /**
   * Validate email attachment
   */
  private validateEmailAttachment(attachment: EmailAttachment, field: string): void {
    if (!attachment || typeof attachment !== 'object') {
      throw new ValidationError(`${field} must be an object`);
    }

    if (!attachment.filename || typeof attachment.filename !== 'string') {
      throw new ValidationError(`${field}.filename is required`);
    }

    if (!attachment.contentType || typeof attachment.contentType !== 'string') {
      throw new ValidationError(`${field}.contentType is required`);
    }

    if (!attachment.content) {
      throw new ValidationError(`${field}.content is required`);
    }

    if (typeof attachment.content !== 'string' && !Buffer.isBuffer(attachment.content)) {
      throw new ValidationError(`${field}.content must be a string or Buffer`);
    }

    if (attachment.cid && typeof attachment.cid !== 'string') {
      throw new ValidationError(`${field}.cid must be a string`);
    }
  }

  /**
   * Process attachment for API request
   */
  private processAttachment(attachment: EmailAttachment): any {
    return {
      filename: attachment.filename,
      contentType: attachment.contentType,
      content: Buffer.isBuffer(attachment.content) 
        ? attachment.content.toString('base64')
        : attachment.content,
      cid: attachment.cid
    };
  }

  /**
   * Parse sent email response and convert dates
   */
  private parseSentEmail(data: any): SentEmail {
    return {
      ...data,
      sentAt: new Date(data.sentAt)
    };
  }
}
