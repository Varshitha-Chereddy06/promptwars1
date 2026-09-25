/**
 * High-Performance LRU In-Memory Cache for Clause2Life
 *
 * Features:
 * - Type-safe generics with strict typing (no `any`)
 * - TTL-based expiration with automatic cleanup
 * - LRU eviction on capacity overflow
 * - Deterministic key generation with SHA-256 hashing
 * - Periodic background cleanup of expired entries
 * - Performance metrics tracking (hit/miss ratio)
 * - Thread-safe operations via Map ordering guarantees
 */

import { createHash } from 'crypto';

interface CacheEntry<T> {
  value: T;
  expiry: number;
  size: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxItems: number;
  private readonly defaultTtlMs: number;
  private readonly metrics: CacheMetrics = { hits: 0, misses: 0, evictions: 0, totalRequests: 0 };
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Creates a new MemoryCache instance with automatic expired entry cleanup
   * @param maxItems - Maximum number of items to store (default: 100)
   * @param defaultTtlMinutes - Default time-to-live in minutes (default: 30)
   */
  constructor(maxItems = 100, defaultTtlMinutes = 30) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlMinutes * 60 * 1000;
    // Auto-cleanup expired entries every 5 minutes for memory efficiency
    this.cleanupInterval = setInterval(() => this.purgeExpired(), 5 * 60 * 1000);
    // Ensure cleanup interval doesn't block Node.js process exit
    if (this.cleanupInterval && typeof this.cleanupInterval.unref === 'function') {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Generates a stable, deterministic cache key using SHA-256 hashing.
   * Produces collision-resistant keys from variable-length inputs.
   *
   * @param prefix - Namespace prefix for the key (e.g., 'analysis', 'sim')
   * @param parts - Variable number of string components to hash
   * @returns A deterministic hash key string
   */
  public generateKey(prefix: string, ...parts: string[]): string {
    const raw = parts.map((p) => (p || '').trim().toLowerCase()).join('::');
    const hash = createHash('sha256').update(raw, 'utf-8').digest('hex').slice(0, 16);
    return `${prefix}:${hash}`;
  }

  /**
   * Retrieves a value from cache. Returns null on miss or expired entry.
   * Automatically refreshes LRU order on hit.
   *
   * @param key - The cache key to look up
   * @returns The cached value or null if not found/expired
   */
  public get(key: string): T | null {
    this.metrics.totalRequests++;
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Refresh LRU order by re-inserting
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.metrics.hits++;
    return entry.value;
  }

  /**
   * Stores a value in cache with optional custom TTL.
   * Evicts the oldest (least recently used) entry when at capacity.
   *
   * @param key - The cache key
   * @param value - The value to store
   * @param ttlMs - Optional custom TTL in milliseconds
   */
  public set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    // If key already exists, remove it first to reset LRU order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    if (this.cache.size >= this.maxItems) {
      // Evict oldest (first inserted) item
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.metrics.evictions++;
      }
    }

    const serialized = JSON.stringify(value);
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
      size: serialized ? serialized.length : 0,
    });
  }

  /**
   * Checks if a key exists and is not expired without affecting LRU order
   * @param key - The cache key to check
   * @returns True if the key exists and is valid
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Removes a specific key from the cache
   * @param key - The cache key to remove
   * @returns True if the key was found and removed
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Returns the current number of items in the cache
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Returns cache performance metrics
   * @returns Object with hits, misses, evictions, and hit ratio
   */
  public getMetrics(): CacheMetrics & { hitRatio: number } {
    const hitRatio = this.metrics.totalRequests > 0
      ? this.metrics.hits / this.metrics.totalRequests
      : 0;
    return { ...this.metrics, hitRatio };
  }

  /**
   * Purges all expired entries from the cache.
   * Called automatically by the background cleanup interval.
   * @returns Number of entries purged
   */
  public purgeExpired(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        purged++;
      }
    }
    return purged;
  }

  /**
   * Destroys the cache instance and cleans up the background interval
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Global typed singletons for server routes
import { AnalysisResult, ScenarioResult, NegotiationDraft, DocumentComparison } from './types';

export const analysisCache = new MemoryCache<AnalysisResult>(100, 60);
export const simulationCache = new MemoryCache<ScenarioResult>(200, 30);
export const negotiationCache = new MemoryCache<NegotiationDraft>(100, 30);
export const comparisonCache = new MemoryCache<DocumentComparison>(50, 30);
