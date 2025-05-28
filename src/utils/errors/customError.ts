import { ErrorCategory } from '../../config/configTypes/errorCategory.enum';

export class CustomError extends Error {
  constructor(
    public readonly category: ErrorCategory,
    public readonly details?: Record<string, unknown>,
    message?: string,
  ) {
    super(message);
    this.name = 'App Error';
  }
}
