import { ApiUrlResolver } from '../base/apiUrlResolver';
import { BookingResources } from '../../resources/restfulBooker.resource';
import ErrorHandler from '../../../utils/errors/errorHandler';

export class BookingEndpoints {
  private apiUrlResolver: ApiUrlResolver;

  constructor(apiUrlResolver: ApiUrlResolver) {
    this.apiUrlResolver = apiUrlResolver;
  }

  public bookingEndpoint(): string {
    return this.apiUrlResolver.generateResourceUrl(this.constructBookingEndpoint(), 'Booking');
  }

  public getBookingEndpointById(id: string | number): string {
    return this.apiUrlResolver.generateResourceUrl(
      this.constructBookingEndpointById(id),
      'Booking',
    );
  }

  private constructBookingEndpointById(id: string | number) {
    try {
      const resolvedEndpoint = this.apiUrlResolver.resolveEndpointId(
        BookingResources.getBookingByIdTemplate,
        { id },
      );

      const resolvedUrl = `${resolvedEndpoint}`;
      return resolvedUrl;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'constructBookingEndpoint',
        'Failed to construct booking endpoint',
      );
      throw error;
    }
  }

  private constructBookingEndpoint() {
    try {
      const constructedUrl = `${BookingResources.booking}`;
      return constructedUrl;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'constructBookingEndpoint',
        'Failed to construct booking endpoint',
      );
      throw error;
    }
  }
}
