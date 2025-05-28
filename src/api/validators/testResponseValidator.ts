import { AxiosResponse, AxiosError } from 'axios';
import { CustomError } from '../../utils/errors/customError';
import { ErrorCategory } from '../../config/configTypes/errorCategory.enum';
import RequestContext from '../context/requestContext';
import ResponseHelper from './apiResponseHandler';
import ErrorHandler from '../../utils/errors/errorHandler';
import logger from '../../utils/logging/loggerManager';

export default class TestResponseValidator {
  /**
   * General method to validate any response with proper context checking
   * @param response - The API response
   * @param expectedStatusCode - The expected status code
   * @param context - The operation context
   * @param forceTestType - Optional: force a specific test type validation
   */
  public static validateResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    context: string,
    forceTestType?: 'positive' | 'negative',
  ): void {
    const isNegativeTest = RequestContext.isNegativeTest(context);
    const actualTestType = isNegativeTest ? 'negative' : 'positive';

    // If forceTestType is specified and doesn't match actual, log info with details
    if (forceTestType && forceTestType !== actualTestType) {
      const expectation = RequestContext.getExpectation(context);
      logger.info(`Test type information for context '${context}'`, {
        context,
        registeredType: actualTestType,
        forcedType: forceTestType,
        testExpectation: {
          expectedStatusCodes: expectation?.expectedStatusCodes || [],
          isNegativeTest: expectation?.isNegativeTest || false,
        },
        message: `Context is registered as ${actualTestType} test but validation requested as ${forceTestType}`,
      });
    }

    // Route to appropriate validation method
    if (isNegativeTest) {
      this.validateNegativeTestResponse(response, expectedStatusCode, context);
    } else {
      this.validatePositiveTestResponse(response, expectedStatusCode, context);
    }
  }

  /**
   * Validates API responses for positive test flows with comprehensive error handling.
   * Verifies expected status codes and processes any error responses.
   * @param response - The API response.
   * @param expectedStatusCode - The expected status code.
   * @param context - The operation context.
   */
  private static validatePositiveTestResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    context: string,
  ): void {
    try {
      const validatedResponse = ResponseHelper.assertResponseNotNull(response, context);
      this.validateStatusCode(validatedResponse.status, expectedStatusCode, context);
      this.handleResponseError(validatedResponse);
    } catch (error) {
      if (this.isExpectedNegativeTestFailure(error, context)) {
        return;
      }

      ErrorHandler.captureError(
        error,
        'validatePositiveTestResponse',
        'Failed to validate API response',
      );
      throw error;
    }
  }

  private static validateNegativeTestResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    context: string,
  ): void {
    const isNegativeTest = RequestContext.isNegativeTest(context);

    // Check if context is NOT registered as negative test and log info with details
    if (!isNegativeTest) {
      const expectation = RequestContext.getExpectation(context);
      logger.info(`Context '${context}' is registered as positive test`, {
        context,
        method: 'validateNegativeTestResponse',
        expectedStatusCode,
        isNegativeTest: false,
        testExpectation: {
          expectedStatusCodes: expectation?.expectedStatusCodes || [],
          isNegativeTest: expectation?.isNegativeTest || false,
        },
        message: 'This context is configured for positive test scenarios',
      });
    }

    try {
      // For null responses in negative tests - consider test passed
      if (!response && isNegativeTest) {
        logger.info(`Null response received as expected for negative test [${context}]`);
        return;
      }

      // Assert response not null
      const validatedResponse = ResponseHelper.assertResponseNotNull(response, context);

      // Short-circuit: if status is explicitly valid for this negative test
      if (isNegativeTest && this.isValidNegativeTestStatus(validatedResponse.status, context)) {
        logger.info(
          `Negative test [${context}] passed as expected with status: ${validatedResponse.status}`,
        );
        return;
      }

      // Handle different validation logic based on test type
      if (isNegativeTest) {
        this.handleNegativeTestResponse(validatedResponse.status, context);
      } else if (validatedResponse.status !== expectedStatusCode) {
        this.throwStatusCodeMismatchError(validatedResponse.status, expectedStatusCode, context);
      } else {
        logger.info(
          `Status Code Validation Successful in [${context}]: ${validatedResponse.status}`,
        );
      }
    } catch (error) {
      // For negative tests, errors are generally expected
      if (isNegativeTest && this.handleNegativeTestError(error, context)) {
        return;
      }

      // For positive tests, propagate the error
      logger.error(
        `Response Validation Failed in [${context}]: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  /**
   * Validates if the actual status code matches the expected status code.
   * For negative tests, also checks if the status is in expected alternatives.
   */
  private static validateStatusCode(actual: number, expected: number, context: string): void {
    const isNegativeTest = RequestContext.isNegativeTest(context);

    // Standard case - actual matches expected
    if (actual === expected) {
      logger.info(`Status Code Validation Successful in [${context}]: ${actual}`);
      return;
    }

    // For negative tests - check for expected alternative status
    if (isNegativeTest && this.isValidNegativeTestStatus(actual, context)) {
      return;
    }

    // Status code mismatch - throw error
    this.throwStatusCodeMismatchError(actual, expected, context);
  }

  /**
   * Handles a response in a negative test context.
   */
  private static handleNegativeTestResponse(status: number, context: string): void {
    if (this.isValidNegativeTestStatus(status, context)) {
      return;
    }

    // Unexpected success status for negative test
    logger.error(`Unexpected success status code ${status} in negative test [${context}]`);
    throw new CustomError(
      ErrorCategory.CONSTRAINT,
      { context },
      `Negative test [${context}] received unexpected success status: ${status}`,
    );
  }

  /**
   * Checks if a status code is valid for a negative test.
   */
  private static isValidNegativeTestStatus(actual: number, context: string): boolean {
    // Case 1: Status is in explicitly expected alternatives
    if (RequestContext.isExpectedStatus(context, actual)) {
      logger.info(
        `Received alternative expected status code ${actual} for negative test: ${context}`,
      );
      return true;
    }

    // Case 2: Any error status (4xx, 5xx) is acceptable for negative tests
    if (actual >= 400) {
      logger.info(
        `Received error status code ${actual} in negative test [${context}], considering test passed`,
      );
      return true;
    }

    return false;
  }

  /**
   * Processes response errors, primarily for responses with status code >= 400.
   */
  private static handleResponseError(response: AxiosResponse): void {
    try {
      // Early return if no response or data
      if (!response || !response.data) {
        const noDataError = new Error('No response data available');
        logger.error(noDataError.message);
        throw noDataError;
      }

      // Throw error for any status code >= 400
      if (response.status >= 400) {
        const {
          code = 'UNKNOWN_CODE',
          type = 'UNKNOWN_TYPE',
          message: errorMessage = 'Unspecified error occurred',
        } = response.data;

        // Create a detailed error with comprehensive information
        const detailedError = new Error(errorMessage);
        Object.assign(detailedError, {
          status: response.status,
          code,
          type,
          responseData: response.data,
        });

        // Log detailed error information
        logger.error(`HTTP Error: ${response.status}`, {
          code,
          type,
          message: errorMessage,
          fullResponse: response.data,
        });

        throw detailedError;
      }
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'handleResponseError',
        'Failed to handle API response error',
      );
      throw error;
    }
  }

  /**
   * Check if an error is an expected failure in a negative test.
   */
  private static isExpectedNegativeTestFailure(error: unknown, context: string): boolean {
    if (error instanceof CustomError && error.category === ErrorCategory.EXPECTED_FAILURE) {
      logger.info(`Expected failure in negative test [${context}]: ${error.message}`);
      return true;
    }
    return false;
  }

  /**
   * Handles error responses in a negative test context.
   */
  private static handleNegativeTestError(error: unknown, context: string): boolean {
    // Expected failure for negative test
    if (this.isExpectedNegativeTestFailure(error, context)) {
      return true;
    }

    // Check if error has a response with an expected status code
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      if (RequestContext.isExpectedStatus(context, status) || status >= 400) {
        logger.info(`Expected error response received in [${context}]: ${status}`);
        return true;
      }
    }

    // Any other error in a negative test is still a pass
    logger.info(
      `Error occurred as expected in negative test [${context}]: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return true;
  }

  /**
   * Throws an error for status code mismatch.
   */
  private static throwStatusCodeMismatchError(
    actual: number,
    expected: number,
    context: string,
  ): void {
    const errorMessage = `Status code mismatch [${context}] - Expected: ${expected}, Received: ${actual}.`;
    logger.error(errorMessage);
    throw new CustomError(ErrorCategory.CONSTRAINT, { context }, errorMessage);
  }
}
