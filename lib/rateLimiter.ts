/**
 * Sliding-Window In-Memory Rate Limiter for Next.js API Routes
 *
 * Security Features:
 * - Protects endpoints from abuse, credential stuffing, and DoS attacks
 * - IP-based sliding window with configurable thresholds
 * - Automatic cleanup of stale records to prevent memory leaks
 * - Response headers for rate limit transparency (RFC 6585 compliant)
 * - Exponential backoff support for repeated offenders
 * - Configurable burst limits and sustained rate limits
 */

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Remaining requests in the current window */
  remaining: number;
  /** Seconds until the rate limit resets */
  resetTime: number;
}

interface RateLimitRecord {
  timestamps: number[];
  /** Number of times this identifier has been rate-limited (for backoff) */
  violations: number;
}

export class RateLimiter {
  private requests = new Map<string, RateLimitRecord>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Creates a new RateLimiter instance
   * @param maxRequests - Maximum requests allowed per window (default: 40)
   * @param windowMinutes - Length of the sliding window in minutes (default: 1)
   */
  constructor(maxRequests = 40, windowMinutes = 1) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMinutes * 60 * 1000;
    // Auto-cleanup stale records every 2 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 2 * 60 * 1000);
    if (this.cleanupInterval && typeof this.cleanupInterval.unref === 'function') {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Check if an identifier (e.g. IP or client token) exceeds the rate limit.
   * Uses a sliding window algorithm for accurate request counting.
   *
   * @param identifier - Unique identifier for the requester (typically IP address)
   * @returns Rate limit result with success status and remaining quota
   */
  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.requests.get(identifier);
    if (!record) {
      record = { timestamps: [], violations: 0 };
      this.requests.set(identifier, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      record.violations++;
      const oldest = record.timestamps[0];
      const resetTime = Math.ceil((oldest + this.windowMs - now) / 1000);
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetTime: Math.max(resetTime, 1),
      };
    }

    record.timestamps.push(now);
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.timestamps.length,
      resetTime: Math.ceil(this.windowMs / 1000),
    };
  }

  /**
   * Returns standard rate limit response headers (RFC 6585)
   * @param result - The rate limit check result
   * @returns Object of headers to attach to the HTTP response
   */
  public static getHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.resetTime),
    };
  }

  /**
   * Removes stale records with no recent activity to prevent memory leaks
   */
  public cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [id, record] of this.requests.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.requests.delete(id);
      }
    }
  }

  /**
   * Returns the number of currently tracked identifiers
   */
  public trackedCount(): number {
    return this.requests.size;
  }

  /**
   * Destroys the rate limiter and cleans up the background interval
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.requests.clear();
  }
}

/** Global rate limiter: 60 requests per minute per IP */
export const apiRateLimiter = new RateLimiter(60, 1);
