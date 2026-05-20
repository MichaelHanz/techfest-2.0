/**
 * Retry utility with exponential backoff for handling transient failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDelayMs: number;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number
): number {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  
  // Add jitter: random value between 0 and cappedDelay
  const jitter = Math.random() * cappedDelay;
  
  return Math.floor(jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (transient failure)
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  
  // Network timeouts
  if (message.includes("timeout") || message.includes("econnrefused")) {
    return true;
  }
  
  // Rate limiting
  if (message.includes("429") || message.includes("rate limit")) {
    return true;
  }
  
  // Temporary server errors
  if (message.includes("503") || message.includes("service unavailable")) {
    return true;
  }
  
  if (message.includes("502") || message.includes("bad gateway")) {
    return true;
  }
  
  if (message.includes("504") || message.includes("gateway timeout")) {
    return true;
  }
  
  // Temporary network issues
  if (message.includes("enotfound") || message.includes("network")) {
    return true;
  }
  
  return false;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Result with success status, data, error, attempts count, and total delay
 * 
 * @example
 * ```ts
 * const result = await retryWithBackoff(
 *   () => invokeLLM({ messages: [...] }),
 *   {
 *     maxAttempts: 3,
 *     initialDelayMs: 1000,
 *     maxDelayMs: 10000,
 *     backoffMultiplier: 2,
 *     onRetry: (attempt, error, delayMs) => {
 *       console.log(`Retry attempt ${attempt} after ${delayMs}ms: ${error.message}`);
 *     }
 *   }
 * );
 * 
 * if (result.success) {
 *   return result.data;
 * } else {
 *   throw result.error;
 * }
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | undefined;
  let totalDelayMs = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt,
        totalDelayMs,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt or error is not retryable, return failure
      if (attempt === maxAttempts || !isRetryableError(error)) {
        return {
          success: false,
          error: lastError,
          attempts: attempt,
          totalDelayMs,
        };
      }

      // Calculate backoff delay
      const delayMs = calculateBackoffDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier
      );

      totalDelayMs += delayMs;

      // Notify about retry
      if (onRetry) {
        onRetry(attempt, lastError, delayMs);
      }

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  // Should never reach here, but just in case
  return {
    success: false,
    error: lastError || new Error("Unknown error"),
    attempts: maxAttempts,
    totalDelayMs,
  };
}
