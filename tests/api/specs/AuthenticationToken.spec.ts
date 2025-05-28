import { test } from '../../../fixtures/restfulBooker.fixture';
import logger from '../../../src/utils/logging/loggerManager';

test.describe('Authentication Token Test Suite @regression', () => {
  test(`verify successful token generation with valid credentials @sanity`, async ({
    authTokenTestResources,
    testId,
    authToken,
  }) => {
    authTokenTestResources.registerAuthTokenExpectation('VALID_CREDENTIALS', [200]);
    const response = await authToken.validCredentialsAuthTokenRequest();
    authTokenTestResources.validateAndStoreAuthToken(response, testId);
    logger.info('Authentication token request with valid credentials completed successfully.');
  });

  test(`verify token generation fails with invalid username`, async ({
    authTokenTestResources,
    authToken,
  }) => {
    authTokenTestResources.registerAuthTokenExpectation('INVALID_USERNAME', [200]);
    const response = await authToken.invalidUsernameCredentialAuthTokenRequest();
    authTokenTestResources.validateInvalidUsername(response);
    logger.info('Authentication token request with invalid username completed successfully.');
  });

  test(`verify token generation fails with invalid password`, async ({
    authTokenTestResources,
    authToken,
  }) => {
    authTokenTestResources.registerAuthTokenExpectation('INVALID_PASSWORD', [200]);
    const response = await authToken.invalidPasswordCredentialAuthTokenRequest();
    authTokenTestResources.validateInvalidPassword(response);
    logger.info('Authentication token request with invalid password completed successfully.');
  });
});
