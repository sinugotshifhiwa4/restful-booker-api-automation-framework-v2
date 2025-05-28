export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds: string;
}

export interface BookingDates {
  checkin: string;
  checkout: string;
}
