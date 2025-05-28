export const TokenResources = {
  authentication: '/auth',
};

export const BookingResources = {
  booking: '/booking',
  getBookingByIdTemplate: '/booking/{id}',
  getBookingById: (id: string | number) => `${BookingResources.booking}/${id}`,
};
