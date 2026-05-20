export interface ValidationError {
  file: string;
  message: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
