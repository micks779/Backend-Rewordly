import NodeCache from "node-cache";

// Set default cache TTL (time-to-live) for 24 hours (in seconds)
const emailCache = new NodeCache({ stdTTL: 86400 });

export function setCache(key: string, value: any): boolean {
  return emailCache.set(key, value);
}

export function getCache(key: string): any {
  return emailCache.get(key);
}

export function deleteCache(key: string): number {
  return emailCache.del(key);
}

export function flushCache(): void {
  emailCache.flushAll();
}

export default {
  setCache,
  getCache,
  deleteCache,
  flushCache
};
