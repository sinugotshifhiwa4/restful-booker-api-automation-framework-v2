import { TokenTestIds } from '../testIds/authTokenTestIds';
import { BookingTestIds, BookingE2ETestIds } from '../testIds/bookingTestIds';

/**
 * Type utility for deep readonly structure
 * Type that makes an object and all its nested objects immutable.
 */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export const TEST_IDS = Object.freeze({
  authToken: TokenTestIds,
  booking: BookingTestIds,
  bookingE2E: BookingE2ETestIds,
}) as DeepReadonly<{
  authToken: typeof TokenTestIds;
  booking: typeof BookingTestIds;
  bookingE2E: typeof BookingE2ETestIds;
  // Add other domains here
}>;

// Export type for consumer convenience
export type TestIds = typeof TEST_IDS;
