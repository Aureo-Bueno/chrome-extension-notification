import type { StorageGateway } from "../domain/gateways.js";

/**
 * Adapter around Chrome local storage.
 */
export class ChromeStorageGateway implements StorageGateway {
  /**
   * Reads a value by key and returns a fallback when key is missing.
   */
  async get<T>(key: string, fallback: T): Promise<T> {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T | undefined) ?? fallback;
  }

  /**
   * Persists a value by key.
   */
  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }
}
