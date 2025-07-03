import { HTTPClient } from './http-client';
import {
  CreateEmailAddressOptions,
  EmailAddress,
  PaginationOptions,
  PaginatedResponse
} from './types';
import { ValidationError, EmailAddressError } from './errors';

/**
 * Service for managing email addresses (temporary and persistent)
 */
export class EmailAddressService {
  constructor(private httpClient: HTTPClient) {}

  /**
   * Create a new email address
   */
  async create(options: CreateEmailAddressOptions): Promise<EmailAddress> {
    this.validateCreateOptions(options);

    const response = await this.httpClient.post<EmailAddress>('/email-addresses', {
      type: options.type,
      prefix: options.prefix,
      domain: options.domain,
      expirationMinutes: options.expirationMinutes,
      metadata: options.metadata
    });

    if (!response.success) {
      throw new EmailAddressError(response.error || 'Failed to create email address');
    }

    return this.parseEmailAddress(response.data);
  }

  /**
   * Get an email address by ID
   */
  async get(id: string): Promise<EmailAddress> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email address ID is required');
    }

    const response = await this.httpClient.get<EmailAddress>(`/email-addresses/${id}`);

    if (!response.success) {
      throw new EmailAddressError(response.error || 'Failed to get email address');
    }

    return this.parseEmailAddress(response.data);
  }

  /**
   * List email addresses with pagination
   */
  async list(options?: {
    type?: 'temporary' | 'persistent';
    status?: 'active' | 'expired' | 'disabled';
    pagination?: PaginationOptions;
  }): Promise<PaginatedResponse<EmailAddress>> {
    const params = new URLSearchParams();

    if (options?.type) {
      params.append('type', options.type);
    }

    if (options?.status) {
      params.append('status', options.status);
    }

    if (options?.pagination?.page) {
      params.append('page', options.pagination.page.toString());
    }

    if (options?.pagination?.limit) {
      params.append('limit', options.pagination.limit.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/email-addresses?${queryString}` : '/email-addresses';

    const response = await this.httpClient.get<PaginatedResponse<EmailAddress>>(endpoint);

    if (!response.success) {
      throw new EmailAddressError(response.error || 'Failed to list email addresses');
    }

    return {
      ...response.data,
      items: response.data.items.map(item => this.parseEmailAddress(item))
    };
  }

  /**
   * Update an email address (for persistent emails)
   */
  async update(id: string, updates: {
    metadata?: Record<string, any>;
    status?: 'active' | 'disabled';
  }): Promise<EmailAddress> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email address ID is required');
    }

    if (!updates || typeof updates !== 'object') {
      throw new ValidationError('Updates object is required');
    }

    const response = await this.httpClient.patch<EmailAddress>(`/email-addresses/${id}`, updates);

    if (!response.success) {
      throw new EmailAddressError(response.error || 'Failed to update email address');
    }

    return this.parseEmailAddress(response.data);
  }

  /**
   * Delete an email address
   */
  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email address ID is required');
    }

    const response = await this.httpClient.delete(`/email-addresses/${id}`);

    if (!response.success) {
      throw new EmailAddressError(response.error || 'Failed to delete email address');
    }
  }

  /**
   * Extend expiration time for a temporary email address
   */
  async extend(id: string, additionalMinutes: number): Promise<EmailAddress> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Email address ID is required');
    }

    if (!additionalMinutes || additionalMinutes <= 0) {
      throw new ValidationError('Additional minutes must be a positive number');
    }

    const response = await this.httpClient.post<EmailAddress>(`/email-addresses/${id}/extend`, {
      additionalMinutes
    });

    if (!response.success) {
      throw new EmailAddressError(response.error || 'Failed to extend email address');
    }

    return this.parseEmailAddress(response.data);
  }

  /**
   * Validate create email address options
   */
  private validateCreateOptions(options: CreateEmailAddressOptions): void {
    if (!options || typeof options !== 'object') {
      throw new ValidationError('Options object is required');
    }

    if (!options.type || !['temporary', 'persistent'].includes(options.type)) {
      throw new ValidationError('Type must be either "temporary" or "persistent"');
    }

    if (options.prefix && typeof options.prefix !== 'string') {
      throw new ValidationError('Prefix must be a string');
    }

    if (options.domain && typeof options.domain !== 'string') {
      throw new ValidationError('Domain must be a string');
    }

    if (options.expirationMinutes !== undefined) {
      if (typeof options.expirationMinutes !== 'number' || options.expirationMinutes <= 0) {
        throw new ValidationError('Expiration minutes must be a positive number');
      }

      if (options.type === 'persistent') {
        throw new ValidationError('Expiration minutes cannot be set for persistent email addresses');
      }
    }

    if (options.metadata && typeof options.metadata !== 'object') {
      throw new ValidationError('Metadata must be an object');
    }
  }

  /**
   * Parse email address response and convert dates
   */
  private parseEmailAddress(data: any): EmailAddress {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    };
  }
}
