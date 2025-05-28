// Types
export type ResourceType =
  | 'Token'
  | 'Booking';

export enum EndpointRoot {
  REST_API_V1 = '/rest/v1',
  PUBLIC_API_V1 = '/api/v1',
}

// Types for parameter validation
export type PrimitiveParameterValue = string | number | boolean;
export type ParameterDictionary = Record<string, PrimitiveParameterValue>;
