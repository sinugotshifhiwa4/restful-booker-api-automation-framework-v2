import { test } from '../../fixtures/crypto.fixture';
import {
  EnvironmentConstants,
  EnvironmentFilePaths,
  EnvironmentSecretKeyVariables,
} from '../../src/utils/environment/constants/environmentFilePaths';
import ENV from '../../src/utils/environment/constants/environmentVariables';
import logger from '../../src/utils/logging/loggerManager';

test.describe.serial('Encryption Flow @encryption', () => {
  test('Generate Secret Key @encryption @generate-key', async ({
    environmentEncryptionCoordinator,
  }) => {
    await environmentEncryptionCoordinator.generateAndStoreSecretKey(
      EnvironmentConstants.ENV_DIR,
      EnvironmentConstants.BASE_ENV_FILE,
      EnvironmentSecretKeyVariables.UAT,
    );

    logger.info('Secret key generation completed successfully.');
  });

  test('Encrypt Credentials @encryption @encrypt', async ({ environmentEncryptionCoordinator }) => {
    // Variables to encrypt
    const VARIABLES_TO_ENCRYPT = [ENV.TOKEN_USERNAME, ENV.TOKEN_PASSWORD];

    await environmentEncryptionCoordinator.orchestrateEnvironmentEncryption(
      EnvironmentConstants.ENV_DIR,
      EnvironmentFilePaths.uat,
      EnvironmentSecretKeyVariables.UAT,
      VARIABLES_TO_ENCRYPT,
    );

    logger.info('Encryption process completed successfully.');
  });
});
