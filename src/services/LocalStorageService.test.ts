// src/services/LocalStorageService.test.ts
import { LocalStorageService } from './LocalStorageService';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LocalStorageService', () => {
  const TEST_KEY = 'testKey';
  const TEST_OBJECT = { id: 1, name: 'Test Object' };
  const TEST_STRING = 'Test String';

  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorageMock.clear();
    // Spy on console.error to check for error logging
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error mock
    (console.error as jest.Mock).mockRestore();
  });

  describe('setItem', () => {
    it('should store a stringified version of an object', () => {
      LocalStorageService.setItem(TEST_KEY, TEST_OBJECT);
      expect(localStorageMock.getItem(TEST_KEY)).toBe(JSON.stringify(TEST_OBJECT));
    });

    it('should store a JSON stringified version of a string', () => {
      LocalStorageService.setItem(TEST_KEY, TEST_STRING);
      expect(localStorageMock.getItem(TEST_KEY)).toBe(JSON.stringify(TEST_STRING));
    });

    it('should log an error if JSON.stringify fails', () => {
      const circularObj: any = {};
      circularObj.self = circularObj;
      LocalStorageService.setItem(TEST_KEY, circularObj);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getItem', () => {
    it('should retrieve and parse a stored object', () => {
      localStorageMock.setItem(TEST_KEY, JSON.stringify(TEST_OBJECT));
      const retrieved = LocalStorageService.getItem<{ id: number; name: string }>(TEST_KEY);
      expect(retrieved).toEqual(TEST_OBJECT);
    });

    it('should retrieve and parse a stored string', () => {
      // Store the string as it would be by setItem (JSON.stringify)
      localStorageMock.setItem(TEST_KEY, JSON.stringify(TEST_STRING));
      const retrieved = LocalStorageService.getItem<string>(TEST_KEY);
      // Expect the original string back, not the stringified version
      expect(retrieved).toBe(TEST_STRING);
    });

    it('should return null if the key does not exist', () => {
      const retrieved = LocalStorageService.getItem(TEST_KEY);
      expect(retrieved).toBeNull();
    });

    it('should return null and log an error if JSON.parse fails', () => {
      localStorageMock.setItem(TEST_KEY, 'invalid_json_string');
      const retrieved = LocalStorageService.getItem(TEST_KEY);
      expect(retrieved).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove an item from localStorage', () => {
      localStorageMock.setItem(TEST_KEY, TEST_STRING);
      LocalStorageService.removeItem(TEST_KEY);
      expect(localStorageMock.getItem(TEST_KEY)).toBeNull();
    });

    it('should not throw an error if key does not exist', () => {
      expect(() => LocalStorageService.removeItem('nonExistentKey')).not.toThrow();
    });
  });
});
