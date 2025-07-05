// src/services/LocalStorageService.ts

export class LocalStorageService {
  /**
   * Stores an item in localStorage.
   * @param key The key under which to store the value.
   * @param value The value to store. Will be JSON.stringified.
   */
  public static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
    }
  }

  /**
   * Retrieves an item from localStorage.
   * @param key The key of the item to retrieve.
   * @returns The retrieved item, parsed as JSON, or null if not found or on error.
   */
  public static getItem<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      // It might be beneficial to remove the corrupted item
      // localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Removes an item from localStorage.
   * @param key The key of the item to remove.
   */
  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  }
}
