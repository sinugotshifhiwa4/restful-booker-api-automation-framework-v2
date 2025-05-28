import { AxiosResponse } from 'axios';
import { AxiosHttpClient } from '../client/axiosHttpClient';
import { TokenEndpoints } from '../endpoints/endpoints/tokenEndpoints';
import { EnvironmentResolver } from '../../config/environment/resolver/environmentResolver';
import * as authTokenPayload from '../../testData/payload/authTokenPayload.json';

export class AuthenticationToken {
  private axiosHttpClient: AxiosHttpClient;
  private tokenEndpoints: TokenEndpoints;
  private environmentResolver: EnvironmentResolver;

  constructor(
    axiosHttpClient: AxiosHttpClient,
    tokenEndpoints: TokenEndpoints,
    environmentResolver: EnvironmentResolver,
  ) {
    this.axiosHttpClient = axiosHttpClient;
    this.tokenEndpoints = tokenEndpoints;
    this.environmentResolver = environmentResolver;
  }

  public async invalidUsernameCredentialAuthTokenRequest(): Promise<AxiosResponse> {
    const credentials = await this.resolvePasswordCredential();

    const response = await this.axiosHttpClient.post(
      this.tokenEndpoints.authTokenEndpoint(),
      credentials,
      undefined,
    );
    return response;
  }

  public async invalidPasswordCredentialAuthTokenRequest(): Promise<AxiosResponse> {
    const credentials = await this.resolveUsernameCredential();

    const response = await this.axiosHttpClient.post(
      this.tokenEndpoints.authTokenEndpoint(),
      credentials,
      undefined,
    );
    return response;
  }

  public async validCredentialsAuthTokenRequest(): Promise<AxiosResponse> {
    const credentials = await this.resolveCredentials();

    const response = await this.axiosHttpClient.post(
      this.tokenEndpoints.authTokenEndpoint(),
      credentials,
      undefined,
    );
    return response;
  }

  private async resolveUsernameCredential() {
    // Resolve the username from the active environment configuration
    const { username } = await this.environmentResolver.getTokenCredentials();

    // payload
    const tokenCredentials = { ...authTokenPayload.Credentials };

    //update payload
    tokenCredentials.username = username;
    tokenCredentials.password = 'invalid_password';

    return tokenCredentials;
  }

  private async resolvePasswordCredential() {
    // Resolve the password from the active environment configuration
    const { password } = await this.environmentResolver.getTokenCredentials();

    // payload
    const tokenCredentials = { ...authTokenPayload.Credentials };

    //update payload
    tokenCredentials.username = 'invalid_username';
    tokenCredentials.password = password;

    return tokenCredentials;
  }

  private async resolveCredentials() {
    // Resolve the username and password from the active environment configuration
    const { username, password } = await this.environmentResolver.getTokenCredentials();

    // payload
    const tokenCredentials = { ...authTokenPayload.Credentials };

    //update payload
    tokenCredentials.username = username;
    tokenCredentials.password = password;

    return tokenCredentials;
  }
}
