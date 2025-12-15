import { logger } from '../utils/logger.js';

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  timeoutMs?: number; // per attempt
  circuitBreakerFailureThreshold?: number; // open circuit after N consecutive failures
  circuitBreakerResetMs?: number; // time window before half-open
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
  circuitBreakerFailureThreshold: 5,
  circuitBreakerResetMs: 60_000,
};

/**
 * RetryService provides exponential backoff retry logic for async operations
 * Useful for IPFS, RPC calls, and other external API calls
 */
export class RetryService {
  private config: Required<RetryConfig>;
  private consecutiveFailures = 0;
  private circuitOpenedAt: number | null = null;

  constructor(config?: RetryConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a function with exponential backoff retry
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string,
    requestId?: string,
  ): Promise<T> {
    // Circuit breaker: if open and not yet reset window, fail fast
    if (this.isCircuitOpen()) {
      const errMsg = `${operationName} blocked by open circuit (failures=${this.consecutiveFailures})`;
      logger.warn(this.prefix(requestId, errMsg));
      throw new Error(errMsg);
    }

    let lastError: Error | null = null;
    let delay = this.config.initialDelay;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const prefix = requestId ? `[${requestId}]` : '';
        logger.info(`${prefix} Attempt ${attempt}/${this.config.maxRetries} for ${operationName}`);

        const result = await this.withTimeout(fn(), this.config.timeoutMs);
        this.resetCircuit();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const prefix = this.prefix(requestId, '');

        this.consecutiveFailures += 1;
        const openCircuit = this.consecutiveFailures >= this.config.circuitBreakerFailureThreshold;

        if (attempt < this.config.maxRetries && !openCircuit) {
          logger.warn(
            `${prefix}${operationName} attempt ${attempt} failed (${lastError.message}). Retrying in ${delay}ms...`,
          );
          await this.sleep(delay);
          delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelay);
        } else {
          if (openCircuit) {
            this.openCircuit();
            logger.error(
              `${prefix}${operationName} opening circuit after ${this.consecutiveFailures} failures: ${lastError.message}`,
            );
          } else {
            logger.error(
              `${prefix}${operationName} failed after ${attempt} attempts: ${lastError.message}`,
            );
          }
        }
      }
    }

    throw lastError || new Error(`${operationName} failed after ${this.config.maxRetries} retries`);
  }

  /**
   * Execute a function with timeout
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs,
        ),
      ),
    ]);
  }

  private openCircuit() {
    this.circuitOpenedAt = Date.now();
  }

  private resetCircuit() {
    this.consecutiveFailures = 0;
    this.circuitOpenedAt = null;
  }

  private isCircuitOpen(): boolean {
    if (this.circuitOpenedAt === null) return false;
    const elapsed = Date.now() - this.circuitOpenedAt;
    if (elapsed >= this.config.circuitBreakerResetMs) {
      // half-open: allow next attempt and reset counters
      this.resetCircuit();
      return false;
    }
    return true;
  }

  private prefix(requestId: string | undefined, msg: string): string {
    const rid = requestId ? `[${requestId}] ` : '';
    return `${rid}${msg}`;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const retryService = new RetryService();
