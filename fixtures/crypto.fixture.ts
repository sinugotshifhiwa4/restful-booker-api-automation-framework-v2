import { test as baseTest } from '@playwright/test';

import { EnvironmentSecretFileManager } from '../src/utils/environment/utils/environmentSecretFileManager';
import { EnvironmentEncryptionManager } from '../src/cryptography/services/environmentEncryptionManager';
import { EnvironmentEncryptionCoordinator } from '../src/cryptography/orchestration/environmentEncryptionCoordinator';

type customFixtures = {
  environmentSecretFileManager: EnvironmentSecretFileManager;
  environmentEncryptionManager: EnvironmentEncryptionManager;
  environmentEncryptionCoordinator: EnvironmentEncryptionCoordinator;
};

export const cryptoFixtures = baseTest.extend<customFixtures>({
  environmentSecretFileManager: async ({}, use) => {
    await use(new EnvironmentSecretFileManager());
  },
  environmentEncryptionManager: async ({}, use) => {
    await use(new EnvironmentEncryptionManager());
  },
  environmentEncryptionCoordinator: async (
    { environmentSecretFileManager, environmentEncryptionManager },
    use,
  ) => {
    await use(
      new EnvironmentEncryptionCoordinator(
        environmentSecretFileManager,
        environmentEncryptionManager,
      ),
    );
  },
});

export const test = cryptoFixtures;
export const expect = baseTest.expect;
