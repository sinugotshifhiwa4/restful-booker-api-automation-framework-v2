import { expect } from '@playwright/test';
import { AxiosResponse } from 'axios';
import ApiResponseHandler from '../apiResponseHandler';
import { ValidTokenResponse, InvalidTokenResponse } from './types/token/authToken.interface';
import ErrorHandler from '../../../utils/errors/errorHandler';

export default class AuthTokenTestValidator {
  public static assertInvalidUsernameCredential(response: AxiosResponse) {
    try {
      const validatedResponse = ApiResponseHandler.validateObjectResponse<InvalidTokenResponse>(
        response,
        'assertInvalidUsernameCredential',
      );

      expect(validatedResponse.reason).toBe('Bad credentials');
      expect(typeof validatedResponse.reason).toBe('string');
      expect(validatedResponse.reason.toLowerCase()).toContain('bad');
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'assertInvalidUsernameCredential',
        'Failed to assert invalid username credential',
      );
      throw error;
    }
  }

  public static assertInvalidPasswordCredential(response: AxiosResponse) {
    try {
      const validatedResponse = ApiResponseHandler.validateObjectResponse<InvalidTokenResponse>(
        response,
        'assertInvalidPasswordCredential',
      );

      expect(validatedResponse.reason).toBe('Bad credentials');
      expect(typeof validatedResponse.reason).toBe('string');
      expect(validatedResponse.reason.toLowerCase()).toContain('bad');
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'assertInvalidPasswordCredential',
        'Failed to assert invalid password credential',
      );
      throw error;
    }
  }

  public static assertAuthenticationToken(response: AxiosResponse) {
    try {
      const validatedResponse = ApiResponseHandler.validateObjectResponse<ValidTokenResponse>(
        response,
        'assertAuthenticationToken',
      );

      expect(validatedResponse.token).toBeDefined();
      expect(typeof validatedResponse.token).toBe('string');
      expect(validatedResponse.token.length).toBeGreaterThan(0);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'assertAuthenticationToken',
        'Failed to assert generated token from valid credentials',
      );
      throw error;
    }
  }
}
