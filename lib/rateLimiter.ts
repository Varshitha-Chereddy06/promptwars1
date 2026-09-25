/**
 * Sliding-Window In-Memory Rate Limiter for Next.js API Routes
 * Protects endpoints from abuse, credential stuffing, and DoS attacks
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private requests = new Map<string, RateLimitRecord>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 40, windowMinutes = 1) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMinutes * 60 * 1000;
  }

  /**
   * Check if an identifier (e.g. IP or client token) exceeds the rate limit
   */
  public check(identifier: string): { success: boolean; limit: number; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.requests.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.requests.set(identifier, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0];
      const resetTime = Math.ceil((oldest + this.windowMs - now) / 1000);
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetTime,
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
}

export const apiRateLimiter = new RateLimiter(60, 1); // 60 requests per minute
