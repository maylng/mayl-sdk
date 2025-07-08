import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { MaylConfig, APIResponse } from './types';
import {
  MaylError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ServerError,
  TimeoutError
} from './errors';

/**
 * HTTP client for making API requests
 */
export class HTTPClient {
  private client: AxiosInstance;
  private readonly config: Required<MaylConfig>;

  constructor(config: MaylConfig) {
    this.config = {
      baseUrl: 'http://api.mayl.ng:8080',
      timeout: 30000,
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'maylng/0.1.0'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: any) => {
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => {
        const customError = this.handleAPIError(error);
        return Promise.reject(customError);
      }
    );
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle API errors and convert them to custom error types
   */
  private handleAPIError(error: AxiosError): MaylError {
    const requestId = error.config?.headers?.['X-Request-ID'] as string;

    // Network errors (no response)
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return new TimeoutError('Request timeout', requestId);
      }
      return new NetworkError(`Network error: ${error.message}`, requestId);
    }

    const { status, data } = error.response;
    const message = (data as any)?.error || error.message;

    switch (status) {
      case 401:
        return new AuthenticationError(message, requestId);
      case 403:
        return new AuthorizationError(message, requestId);
      case 404:
        return new NotFoundError('Resource', undefined, requestId);
      case 400:
        return new ValidationError(message, undefined, requestId);
      case 429:
        const retryAfter = error.response.headers?.['retry-after'];
        return new RateLimitError(
          message,
          retryAfter ? parseInt(retryAfter) : undefined,
          requestId
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, status, requestId);
      default:
        return new ServerError(`HTTP ${status}: ${message}`, status, requestId);
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.get(endpoint, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.post(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.put(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.patch(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.delete(endpoint, config);
    return response.data;
  }

  /**
   * Update the API key
   */
  updateApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
  }

  /**
   * Update the base URL
   */
  updateBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }
}
