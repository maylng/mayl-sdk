import { HTTPClient } from './http-client';
import { EmailAddressService } from './email-address-service';
import { EmailService } from './email-service';
import { InboxSDKConfig } from './types';
import { ValidationError } from './errors';

/**
 * Main InboxSDK client for managing email addresses and sending emails
 */
export class InboxSDK {
  private httpClient: HTTPClient;
  
  /** Email address management service */
  public readonly emailAddresses: EmailAddressService;
  
  /** Email sending service */
  public readonly emails: EmailService;

  constructor(config: InboxSDKConfig) {
    this.validateConfig(config);
    
    this.httpClient = new HTTPClient(config);
    this.emailAddresses = new EmailAddressService(this.httpClient);
    this.emails = new EmailService(this.httpClient);
  }

  /**
   * Update the API key
   */
  updateApiKey(apiKey: string): void {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new ValidationError('API key is required and must be a string');
    }
    
    this.httpClient.updateApiKey(apiKey);
  }

  /**
   * Update the base URL
   */
  updateBaseUrl(baseUrl: string): void {
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new ValidationError('Base URL is required and must be a string');
    }
    
    this.httpClient.updateBaseUrl(baseUrl);
  }

  /**
   * Health check - verify API connectivity and authentication
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    timestamp: Date;
    apiVersion?: string;
    accountId?: string;
  }> {
    try {
      const response = await this.httpClient.get<{
        status: string;
        message: string;
        apiVersion: string;
        accountId: string;
      }>('/health');

      return {
        status: 'healthy',
        message: response.data.message || 'API is healthy',
        timestamp: new Date(),
        apiVersion: response.data.apiVersion,
        accountId: response.data.accountId
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        message: error.message || 'Health check failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get account information and usage statistics
   */
  async getAccountInfo(): Promise<{
    accountId: string;
    plan: string;
    emailAddressLimit: number;
    emailAddressUsed: number;
    emailsSentThisMonth: number;
    emailLimitPerMonth: number;
    createdAt: Date;
    lastActivity: Date;
  }> {
    const response = await this.httpClient.get<{
      accountId: string;
      plan: string;
      emailAddressLimit: number;
      emailAddressUsed: number;
      emailsSentThisMonth: number;
      emailLimitPerMonth: number;
      createdAt: string;
      lastActivity: string;
    }>('/account');

    const data = response.data;
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      lastActivity: new Date(data.lastActivity)
    };
  }

  /**
   * Validate SDK configuration
   */
  private validateConfig(config: InboxSDKConfig): void {
    if (!config || typeof config !== 'object') {
      throw new ValidationError('Configuration object is required');
    }

    if (!config.apiKey || typeof config.apiKey !== 'string') {
      throw new ValidationError('API key is required and must be a string');
    }

    if (config.baseUrl && typeof config.baseUrl !== 'string') {
      throw new ValidationError('Base URL must be a string');
    }

    if (config.timeout !== undefined) {
      if (typeof config.timeout !== 'number' || config.timeout <= 0) {
        throw new ValidationError('Timeout must be a positive number');
      }
    }
  }
}

/**
 * Create a new InboxSDK instance
 */
export function createInboxSDK(config: InboxSDKConfig): InboxSDK {
  return new InboxSDK(config);
}
