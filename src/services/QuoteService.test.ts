/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuoteService } from './QuoteService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('QuoteService', () => {
  beforeEach(() => {
    // Reset the singleton instance to ensure fresh state for each test
    // This is a hack for testing singletons
    (QuoteService as any).instance = null;
    localStorage.clear();
  });

  it('should initialize and load quotes from data', async () => {
    const service = await QuoteService.getInstance();
    expect(service).toBeDefined();

    const quote = service.getRandomQuote();
    expect(quote).toBeDefined();
    // Verify it's not empty
    expect(quote?.text).toBeTruthy();
    expect(quote?.author).toBeTruthy();
  });

  it('should persist favorites', async () => {
      const service = await QuoteService.getInstance();
      const quote = service.getRandomQuote();
      if (!quote) throw new Error("No quote");

      service.addFavorite(quote.id);
      expect(service.isQuoteFavorited(quote.id)).toBe(true);

      // Verify localStorage
      const storedFavs = localStorage.getItem('quote-app-favorites');
      expect(storedFavs).toContain(quote.id);
  });

  it('should persist viewed history', async () => {
      const service = await QuoteService.getInstance();
      const quote = service.getRandomQuote();
      if (!quote) throw new Error("No quote");

      // getRandomQuote automatically marks as viewed
      const storedViewed = localStorage.getItem('quote-app-viewed');
      expect(storedViewed).toContain(quote.id);
  });
});
