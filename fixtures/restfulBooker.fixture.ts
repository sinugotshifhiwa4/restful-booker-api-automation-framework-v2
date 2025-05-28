import { test as baseTest, TestInfo } from '@playwright/test';
import { EnvironmentResolver } from '../src/config/environment/resolver/environmentResolver';
import { FetchCIEnvironmentVariables } from '../src/config/environment/resolver/fetchCIEnvironmentVariables';
import { FetchLocalEnvironmentVariables } from '../src/config/environment/resolver/fetchLocalEnvironmentVariables';
import { TEST_IDS, TestIds } from '../src/utils/dataStore/testIds/testIds.const';
import { AxiosHttpClient } from '../src/api/client/axiosHttpClient';
import { ApiUrlResolver } from '../src/api/endpoints/base/apiUrlResolver';
import { TokenEndpoints } from '../src/api/endpoints/endpoints/tokenEndpoints';
import { BookingEndpoints } from '../src/api/endpoints/endpoints/bookingEndpoints';
import { AuthenticationToken } from '../src/api/services/authenticationToken';
import { AuthTokenTestResources } from '../tests/api/testResources/authTokenTestResources';

type ApplicationModelFixtures = {
  // Common
  environmentResolver: EnvironmentResolver;
  fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
  testInfo: TestInfo;

  // API
  testId: TestIds;
  axiosHttpClient: AxiosHttpClient;
  apiUrlResolver: ApiUrlResolver;

  tokenEndpoints: TokenEndpoints;
  bookingEndpoints: BookingEndpoints;
  authTokenTestResources: AuthTokenTestResources;
  authToken: AuthenticationToken;
};

const applicationModelTests = baseTest.extend<ApplicationModelFixtures>({
  // Common
  fetchCIEnvironmentVariables: async ({}, use) => {
    await use(new FetchCIEnvironmentVariables());
  },
  fetchLocalEnvironmentVariables: async ({}, use) => {
    await use(new FetchLocalEnvironmentVariables());
  },
  environmentResolver: async (
    { fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables },
    use,
  ) => {
    await use(new EnvironmentResolver(fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables));
  },
  testInfo: async ({}, use) => {
    await use(baseTest.info());
  },

  // API
  testId: async ({}, use) => {
    await use(TEST_IDS);
  },
  // httpClient: async ({}, use) => {
  //   await use(new HttpClient());
  // },
  axiosHttpClient: async ({}, use) => {
    await use(new AxiosHttpClient());
  },
  apiUrlResolver: async ({ environmentResolver }, use) => {
    await use(await ApiUrlResolver.create(environmentResolver));
  },

  tokenEndpoints: async ({ apiUrlResolver }, use) => {
    await use(new TokenEndpoints(apiUrlResolver));
  },
  bookingEndpoints: async ({ apiUrlResolver }, use) => {
    await use(new BookingEndpoints(apiUrlResolver));
  },
  authTokenTestResources: async ({}, use) => {
    await use(new AuthTokenTestResources());
  },
  authToken: async ({ axiosHttpClient, tokenEndpoints, environmentResolver }, use) => {
    await use(new AuthenticationToken(axiosHttpClient, tokenEndpoints, environmentResolver));
  },
});

export const test = applicationModelTests;
export const expect = baseTest.expect;
