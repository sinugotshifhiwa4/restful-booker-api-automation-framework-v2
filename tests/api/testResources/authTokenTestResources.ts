import { AxiosResponse } from 'axios';
import RequestContext from '../../../src/api/context/requestContext';
import TestDataMapStore from '../../../src/utils/dataStore/utils/testDataMapStore';
import { RestfulBookerMaps } from '../../../src/utils/dataStore/maps/restfulBookerMap';
import { TestIds } from '../../../src/utils/dataStore/testIds/testIds.const';
import TestResponseValidator from '../../../src/api/validators/testResponseValidator';
import AuthTokenTestValidator from '../../../src/api/validators/response/authTokenTestValidator';
import ApiResponseHandler from '../../../src/api/validators/apiResponseHandler';
import { AUTHENTICATION_TOKEN } from './testIdentifierContext';

export class AuthTokenTestResources {
  public storeAuthenticationToken(testId: TestIds, token: string): void {
    TestDataMapStore.setValue(
      RestfulBookerMaps.authToken,
      testId.authToken.GENERATE_FROM_VALID_CREDENTIALS,
      'token',
      token,
    );
  }

  public getAuthenticationToken(testId: TestIds): string | undefined {
    return TestDataMapStore.getValue(
      RestfulBookerMaps.authToken,
      testId.authToken.GENERATE_FROM_VALID_CREDENTIALS,
      'token',
    ) as string;
  }

  public getValidatedAuthenticationToken(testId: TestIds): string {
    const token = this.getAuthenticationToken(testId);

    if (!token) {
      throw new Error('Authentication token cannot be null or undefined');
    }

    return token;
  }

  public registerAuthTokenExpectation(
    context: keyof typeof AUTHENTICATION_TOKEN,
    expectedStatusCodes: number[],
    isNegative: boolean = false,
  ): void {
    RequestContext.registerExpectation(
      AUTHENTICATION_TOKEN[context],
      expectedStatusCodes,
      isNegative,
    );
  }

  /**
   * Validates product response with common validation logic
   * @param response - The API response
   * @param expectedStatusCode - Expected status code
   * @param context - The product context
   * @param testType - Type of test ('positive' or 'negative')
   */
  public validateAuthTokenResponse(
    response: AxiosResponse,
    expectedStatusCode: number,
    context: string,
    testType: 'positive' | 'negative',
  ): void {
    TestResponseValidator.validateResponse(response, expectedStatusCode, context, testType);
  }

  public extractAndStoreAuthToken(response: AxiosResponse, testId: TestIds): string {
    const token = ApiResponseHandler.extractPropertyFromResponse<string>(
      response,
      'token',
      AUTHENTICATION_TOKEN.VALID_CREDENTIALS,
    );

    this.storeAuthenticationToken(testId, token);
    return token;
  }

  public validateAndStoreAuthToken(response: AxiosResponse, testId: TestIds): void {
    // Validate response
    this.validateAuthTokenResponse(
      response,
      200,
      AUTHENTICATION_TOKEN.VALID_CREDENTIALS,
      'positive',
    );
    AuthTokenTestValidator.assertAuthenticationToken(response);

    // Extract and store product ID
    this.extractAndStoreAuthToken(response, testId);
  }

  // Invalid

  public validateInvalidUsername(response: AxiosResponse): void {
    // Validate response
    this.validateAuthTokenResponse(
      response,
      200,
      AUTHENTICATION_TOKEN.INVALID_USERNAME,
      'positive',
    );
    AuthTokenTestValidator.assertInvalidUsernameCredential(response);
  }

  public validateInvalidPassword(response: AxiosResponse): void {
    // Validate response
    this.validateAuthTokenResponse(
      response,
      200,
      AUTHENTICATION_TOKEN.INVALID_PASSWORD,
      'positive',
    );
    AuthTokenTestValidator.assertInvalidPasswordCredential(response);
  }
}
