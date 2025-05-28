import { ErrorCategory } from '../../config/configTypes/errorCategory.enum';
import axios from 'axios';
import { CustomError } from './customError';
import { AppErrorLike } from '../../config/configTypes/errorHandler.interface';
import RequestContext from '../../api/context/requestContext';
import ErrorHandler from './errorHandler';
import logger from '../logging/loggerManager';

/**
 * Class responsible for converting various error types into standardized API responses
 */
export default class ApiErrorResponseBuilder {
  public static captureApiError(
    error: unknown,
    source: string,
    context?: string,
  ): {
    success: false;
    error: string;
    code: string;
    statusCode: number;
    details?: Record<string, unknown>;
  } {
    if (this.isExpectedNegativeTestError(error, source)) {
      const statusCode = axios.isAxiosError(error) ? error.response?.status : undefined;
      logger.info(
        `Expected error in negative test at [${source}]: Status Code ${statusCode} — Skipping error log.`,
      );
    } else {
      ErrorHandler.captureError(error, source, context);
    }

    const errorInfo = this.extractErrorInfo(error);
    const statusCode = this.mapCategoryToStatusCode(errorInfo.category, errorInfo.statusCode);

    return {
      success: false,
      error: errorInfo.message,
      code: errorInfo.category,
      statusCode,
      ...(errorInfo.details ? { details: errorInfo.details } : {}),
    };
  }

  /**
   * Handle errors in negative test scenarios
   */
  public static handleNegativeTestError(error: unknown, methodName: string): void {
    if (this.isExpectedNegativeTestError(error, methodName)) {
      const statusCode = axios.isAxiosError(error) ? error.response?.status : undefined;
      logger.info(
        `Expected failure handled correctly in negative test [${methodName}] — Status: ${statusCode}`,
      );
    } else {
      this.captureApiError(
        error,
        methodName,
        `Unexpected error occurred in negative test for ${methodName}`,
      );
      throw error;
    }
  }

  /**
   * Extract standardized error information from various error types
   */
  private static extractErrorInfo(error: unknown): {
    message: string;
    category: ErrorCategory;
    statusCode: number;
    details?: Record<string, unknown>;
  } {
    // Default values
    let message = 'An unexpected error occurred';
    let category = ErrorCategory.UNKNOWN;
    let statusCode = 0; // Use 0 to indicate unknown / no valid HTTP response
    let details: Record<string, unknown> | undefined;

    // Extract from AppError or AppErrorLike
    const appErrorLike = this.getAppErrorLike(error);
    if (appErrorLike) {
      message = appErrorLike.message || message;
      category = appErrorLike.category;
      details = appErrorLike.details;
    } else if (error instanceof Error) {
      message = error.message;
    }

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      statusCode = error.response?.status ?? statusCode;

      const dataMsg = error.response?.data?.message;
      if (typeof dataMsg === 'string') {
        message = dataMsg;
      }

      details = {
        ...details,
        requestInfo: {
          url: error.config?.url,
          method: error.config?.method,
        },
      };
    }

    // Fallback: use sanitized & consistent message if still default
    if (message === 'An unexpected error occurred') {
      message = ErrorHandler.getErrorMessage(error);
    }

    return {
      message,
      category,
      statusCode,
      details,
    };
  }

  /**
   * Get AppError-like properties from an error object
   */
  private static getAppErrorLike(error: unknown): AppErrorLike | null {
    if (error instanceof CustomError) {
      return error;
    } else if (error instanceof Error && this.isAppErrorLike(error)) {
      return {
        message: error.message,
        category: error.category,
        details: error.details,
      };
    }
    return null;
  }

  /**
   * Determines if the given error is an expected result in a negative test scenario.
   * An error is considered expected if:
   * - The test context is marked as a negative test.
   * - The error is an Axios error with a valid HTTP status.
   * - The status code is explicitly registered as expected for this context.
   */
  private static isExpectedNegativeTestError(error: unknown, context: string): boolean {
    if (!context || !axios.isAxiosError(error) || !error.response?.status) {
      return false;
    }

    const status = error.response.status;
    return (
      RequestContext.isNegativeTest(context) && RequestContext.isExpectedStatus(context, status)
    );
  }

  /**
   * Determine if an error-like object is an AppError or has a similar shape.
   * @param err - The object to check.
   * @returns True if the object is either an AppError or has a category property
   * that is a string, and optionally a details property that is an object or
   * undefined.
   */
  private static isAppErrorLike(err: unknown): err is {
    category: ErrorCategory;
    details?: Record<string, unknown>;
  } {
    return (
      err !== null &&
      typeof err === 'object' &&
      'category' in err &&
      typeof (err as Record<string, unknown>).category === 'string' &&
      (!('details' in err) ||
        (err as Record<string, unknown>).details === undefined ||
        typeof (err as Record<string, unknown>).details === 'object')
    );
  }

  /**
   * Map error category to appropriate HTTP status code
   */
  private static mapCategoryToStatusCode(
    category: ErrorCategory,
    defaultStatusCode: number,
  ): number {
    switch (category) {
      // 400-level
      case ErrorCategory.CONSTRAINT:
      case ErrorCategory.HTTP_CLIENT:
      case ErrorCategory.TEST:
        return 400; // Bad Request
      case ErrorCategory.AUTHENTICATION:
        return 401; // Unauthorized
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.PERMISSION:
        return 403; // Forbidden
      case ErrorCategory.NOT_FOUND:
        return 404; // Not Found
      case ErrorCategory.TIMEOUT:
        return 408; // Request Timeout (standard timeout code)

      // 500-level
      case ErrorCategory.DATABASE:
      case ErrorCategory.TRANSACTION:
      case ErrorCategory.QUERY:
        return 500; // Internal Server Error
      case ErrorCategory.CONFIGURATION:
        return 501; // Not Implemented
      case ErrorCategory.SERVICE:
      case ErrorCategory.HTTP_SERVER:
      case ErrorCategory.PERFORMANCE:
        return 503; // Service Unavailable
      case ErrorCategory.NETWORK:
      case ErrorCategory.CONNECTION:
        return 504; // Gateway Timeout

      // Default fallback
      default:
        return defaultStatusCode || 500; // Default to 500 if defaultStatusCode is falsy
    }
  }
}
