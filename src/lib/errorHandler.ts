import { toast } from "@/components/ui/use-toast"

export type ErrorSeverity = 'low' | 'medium' | 'high';
export type ErrorCode = 
  | 'WALLET_NOT_FOUND'
  | 'SIGNATURE_FAILED'
  | 'AUTH_FAILED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR'
  | 'NO_RESPONSE'
  | 'WALLET_NOT_CONNECTED'
  | 'WEBSOCKET_ERROR';

export interface AppError extends Error {
  code: ErrorCode;
  severity: ErrorSeverity;
}

export const createAppError = (message: string, code: ErrorCode, severity: ErrorSeverity): AppError => {
  const error = new Error(message) as AppError;
  error.code = code;
  error.severity = severity;
  return error;
};

export const handleError = (error: unknown) => {
  const appError = error as AppError;
  
  toast({
    title: appError.code || 'Error',
    description: appError.message || 'An unexpected error occurred',
    variant: "destructive",
  });

  // Log errors for debugging
  console.error('Error details:', {
    message: appError.message,
    code: appError.code,
    severity: appError.severity,
    stack: appError.stack
  });
};