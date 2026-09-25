/**
 * High-Performance LRU In-Memory Cache for Clause2Life
 * Caches document analyses and simulation results with TTL for sub-millisecond response times
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxItems: number;
  private defaultTtlMs: number;

  constructor(maxItems = 100, defaultTtlMinutes = 30) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlMinutes * 60 * 1000;
  }

  /**
   * Generates a stable deterministic hash key for queries
   */
  public generateKey(prefix: string, ...parts: string[]): string {
    const raw = parts.map((p) => (p || '').trim().toLowerCase()).join('::');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `${prefix}:${hash}:${raw.length}`;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  public set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    if (this.cache.size >= this.maxItems) {
      // Evict oldest item
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// Global singletons for server routes
export const analysisCache = new MemoryCache<any>(100, 60);
export const simulationCache = new MemoryCache<any>(200, 30);
export const negotiationCache = new MemoryCache<any>(100, 30);
export const comparisonCache = new MemoryCache<any>(50, 30);
