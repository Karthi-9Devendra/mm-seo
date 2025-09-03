// Simple in-memory cache for server-side caching
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000; // Maximum cache entries

  set<T>(key: string, data: T, ttl: number = 3600): void {
    // Clean up expired entries
    this.cleanup();

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Create singleton instance
const memoryCache = new MemoryCache();

// Export cache functions
export async function getCachedData<T>(key: string): Promise<T | null> {
  return memoryCache.get<T>(key);
}

export async function setCachedData<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
  memoryCache.set(key, data, ttl);
}

export async function invalidateCache(pattern: string): Promise<void> {
  // Simple pattern matching for memory cache
  for (const key of memoryCache['cache'].keys()) {
    if (key.includes(pattern.replace('*', ''))) {
      memoryCache.delete(key);
    }
  }
}

// Cache key generators
export function getCitiesCacheKey(stateKey: string, page: number, searchTerm: string = ''): string {
  return `cities:${stateKey}:${page}:${searchTerm}`;
}

export function getZipCodesCacheKey(stateKey: string, page: number, searchTerm: string = ''): string {
  return `zipcodes:${stateKey}:${page}:${searchTerm}`;
}

export function getStatesCacheKey(): string {
  return 'states:all';
}

export function getSpecializationsCacheKey(): string {
  return 'specializations:all';
}

// Debug function
export function getCacheStats() {
  return {
    size: memoryCache.size(),
    keys: Array.from(memoryCache['cache'].keys())
  };
} 