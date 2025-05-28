import { UserCredentials } from '../../configTypes/userCredentials.interface';
import { CIEnvironmentVariables } from '../../configTypes/ciEnvironmentVariables.interface';
import SanitizationConfig from '../../../utils/sanitization/sanitizationConfig';
import ErrorHandler from '../../../utils/errors/errorHandler';

export class FetchCIEnvironmentVariables {
  // Store CI credentials from environment variables
  private readonly ciEnvironmentVariables: CIEnvironmentVariables = {
    appVersion: process.env.CI_APP_VERSION!,
    testPlatform: process.env.CI_TEST_PLATFORM!,
    testType: process.env.CI_TEST_TYPE!,
    apiBaseUrl: process.env.CI_API_BASE_URL!,
    tokenUsername: process.env.CI_TOKEN_USERNAME!,
    tokenPassword: process.env.CI_TOKEN_PASSWORD!,
  };

  public async getAppVersion(): Promise<string> {
    return this.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.appVersion,
      'CI_APP_VERSION',
      'getAppVersion',
      'Failed to get CI app version',
    );
  }

  public async getTestPlatform(): Promise<string> {
    return this.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.testPlatform,
      'CI_TEST_PLATFORM',
      'getTestPlatform',
      'Failed to get CI test platform',
    );
  }

  public async getTestType(): Promise<string> {
    return this.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.testType,
      'CI_TEST_TYPE',
      'getTestType',
      'Failed to get CI test type',
    );
  }

  /**
   * Get API base URL from CI environment variables
   */
  public async getApiBaseUrl(): Promise<string> {
    return this.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.apiBaseUrl,
      'CI_API_BASE_URL',
      'getApiBaseUrl',
      'Failed to get CI API base URL',
    );
  }

  /**
   * Get credentials from CI environment variables
   */
  public async getTokenCredentials(): Promise<UserCredentials> {
    try {
      const credentials = {
        username: SanitizationConfig.sanitizeString(this.ciEnvironmentVariables.tokenUsername),
        password: SanitizationConfig.sanitizeString(this.ciEnvironmentVariables.tokenPassword),
      };
      this.verifyCredentials(credentials);
      return credentials;
    } catch (error) {
      ErrorHandler.captureError(error, 'getTokenCredentials', 'Failed to get CI token credentials');
      throw error;
    }
  }

  /**
   * Verifies that the provided credentials contain both a username and password
   */
  private verifyCredentials(credentials: UserCredentials): void {
    if (!credentials.username || !credentials.password) {
      ErrorHandler.logAndThrow(
        'Invalid credentials: Missing username or password.',
        'FetchCIEnvironmentVariables',
      );
    }
  }

  /**
   * Validates that an environment variable is not empty
   */
  private validateEnvironmentVariable(value: string, variableName: string): void {
    if (!value || value.trim() === '') {
      throw new Error(`Environment variable ${variableName} is not set or is empty`);
    }
  }

  /**
   * Generic method to retrieve and validate environment variables
   */
  private async getEnvironmentVariable(
    getValue: () => string,
    variableName: string,
    methodName: string,
    errorMessage: string,
  ): Promise<string> {
    try {
      const value = getValue();
      this.validateEnvironmentVariable(value, variableName);
      return SanitizationConfig.sanitizeString(value);
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }
}
