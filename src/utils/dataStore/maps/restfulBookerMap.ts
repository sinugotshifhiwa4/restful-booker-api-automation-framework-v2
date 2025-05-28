import { StorableObject } from './../../../config/configTypes/testDataStore.types';
import { ValidTokenResponse } from './../../../api/validators/response/types/token/authToken.interface';
import {
  BookingResponse,
  Booking,
} from './../../../api/validators/response/types/booking/booking.interface';

export const RestfulBookerMaps = {
  authToken: new Map<string, ValidTokenResponse & StorableObject>(),
  booking: new Map<string, BookingResponse & StorableObject>(),
  bookingDetails: new Map<string, Booking & StorableObject>(),
  bookingE2E: new Map<string, BookingResponse & StorableObject>(),
  bookingE2EDetails: new Map<string, Booking & StorableObject>(),
};
