import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { HTTP_MEDIA_TYPES } from './httpMediaType';
import ApiErrorHandler from '../../utils/errors/apiErrorResponseBuilder';
import ErrorHandler from '../../utils/errors/errorHandler';

export class AxiosHttpClient {
  private readonly defaultHeaders: Record<string, string>;

  /**
   * Initializes the HttpClient with default headers and SSL configuration.
   */
  constructor() {
    this.defaultHeaders = {
      'Content-Type': HTTP_MEDIA_TYPES.APPLICATION_JSON,
      'Accept': HTTP_MEDIA_TYPES.ACCEPT
    };
  }

  /**
   * Creates axios configuration with appropriate SSL handling
   */
  private createAxiosConfig(headers?: Record<string, string>): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: { ...this.defaultHeaders, ...headers },
    };

    return config;
  }

  private createHeaders(
    authorizationHeader?: string,
    cookieHeader?: string,
  ): { [key: string]: string } {
    const headers = { ...this.defaultHeaders };

    if (authorizationHeader) {
      headers['Authorization'] = authorizationHeader;
    }

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    return headers;
  }

  /**
   * Sends an HTTP request using the specified method, endpoint, payload, and headers.
   * Returns both successful and error responses without throwing.
   *
   * @template T - The expected response type.
   * @param method - The HTTP method to use for the request
   * @param endpoint - The URL endpoint to which the request is sent.
   * @param payload - The optional payload to be included in the request body.
   * @param headers - Optional headers to be included in the request.
   * @returns A promise that resolves with the Axios response (success or error).
   * @throws Will only throw for non-HTTP errors (network issues, timeouts, etc.)
   */
  private async sendRequest<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    payload?: unknown,
    headers?: Record<string, string>,
  ): Promise<AxiosResponse<T>> {
    try {
      const config = this.createAxiosConfig(headers);

      // Use appropriate axios method based on HTTP verb
      switch (method) {
        case 'get':
        case 'delete':
          return await axios[method]<T>(endpoint, config);
        case 'post':
        case 'put':
        case 'patch':
          return await axios[method]<T>(endpoint, payload, config);
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      return this.handleRequestError<T>(error, method, endpoint);
    }
  }

  // Public HTTP method implementations
  async get<T>(endpoint: string, bearerToken?: string): Promise<AxiosResponse<T>> {
    const headers = this.createHeaders(bearerToken);
    return this.sendRequest<T>('get', endpoint, undefined, headers);
  }

  async post<T>(
    endpoint: string,
    payload?: unknown,
    bearerToken?: string,
  ): Promise<AxiosResponse<T>> {
    const headers = this.createHeaders(bearerToken);
    return this.sendRequest<T>('post', endpoint, payload, headers);
  }

  async put<T>(
    endpoint: string,
    payload?: unknown,
    bearerToken?: string,
  ): Promise<AxiosResponse<T>> {
    const headers = this.createHeaders(bearerToken);
    return this.sendRequest<T>('put', endpoint, payload, headers);
  }

  async patch<T>(
    endpoint: string,
    payload?: unknown,
    bearerToken?: string,
  ): Promise<AxiosResponse<T>> {
    const headers = this.createHeaders(bearerToken);
    return this.sendRequest<T>('patch', endpoint, payload, headers);
  }

  async delete<T>(endpoint: string, bearerToken?: string): Promise<AxiosResponse<T>> {
    const headers = this.createHeaders(bearerToken);
    return this.sendRequest<T>('delete', endpoint, undefined, headers);
  }

  /**
   * Handles request errors consistently
   */
  private handleRequestError<T>(
    error: unknown,
    method: string,
    endpoint: string,
  ): AxiosResponse<T> {
    const methodUpper = method.toUpperCase();

    if (axios.isAxiosError(error)) {
      ApiErrorHandler.captureApiError(
        error,
        `${methodUpper} Request`,
        `${methodUpper} request failed for ${endpoint}`,
      );

      if (error.response) {
        return error.response as AxiosResponse<T>;
      }

      // For network errors, timeouts, etc. where there's no HTTP response,
      // we still need to throw as these represent infrastructure issues
      ErrorHandler.logAndThrow(
        `${methodUpper} request failed for ${endpoint}: ${error.message}`,
        'AxiosHttpClient.sendRequest',
      );
    }

    // Handle non-Axios errors
    ErrorHandler.captureError(
      error,
      'AxiosHttpClient.sendRequest',
      `${methodUpper} request failed for ${endpoint}`,
    );
    throw error;
  }

  /**
   * Helper method to check if a response indicates success
   */
  public isSuccessResponse<T>(response: AxiosResponse<T>): boolean {
    return response.status >= 200 && response.status < 300;
  }

  /**
   * Helper method to check if a response indicates an error
   */
  public isErrorResponse<T>(response: AxiosResponse<T>): boolean {
    return response.status >= 400;
  }
}
