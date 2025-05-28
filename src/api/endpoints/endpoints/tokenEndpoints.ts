import { ApiUrlResolver } from '../base/apiUrlResolver';
import { TokenResources } from '../../resources/restfulBooker.resource';
import ErrorHandler from '../../../utils/errors/errorHandler';

export class TokenEndpoints {
  private apiUrlResolver: ApiUrlResolver;

  constructor(apiUrlResolver: ApiUrlResolver) {
    this.apiUrlResolver = apiUrlResolver;
  }

  public authTokenEndpoint(): string {
    return this.apiUrlResolver.generateResourceUrl(this.constructTokenEndpoint(), 'Token');
  }

  private constructTokenEndpoint() {
    try {
      const constructedUrl = `${TokenResources.authentication}`;
      return constructedUrl;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'constructTokenEndpoint',
        'Failed to construct token endpoint',
      );
      throw error;
    }
  }
}
