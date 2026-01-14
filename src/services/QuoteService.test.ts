import { QuoteService } from './QuoteService';

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      quotes: [
          { id: '1', text: 'Test Quote 1', author: 'Author 1' },
          { id: '2', text: 'Test Quote 2', author: 'Author 2' }
      ]
    }),
  })
) as jest.Mock;

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
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize and fetch quotes from API', async () => {
    const service = await QuoteService.getInstance();
    expect(service).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith('/api/quotes');

    // Verify fallback or fetched data works
    const quote = service.getRandomQuote();
    expect(quote).toBeDefined();
    // Since we mocked fetch, it should come from there
    expect(quote?.text).toContain('Test Quote');
  });

  it('should fallback if API fails', async () => {
     (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject('API Error')
     );

     const service = await QuoteService.getInstance();
     const quote = service.getRandomQuote();
     // Should fallback to hardcoded list
     expect(quote).toBeDefined();
     expect(quote?.text).toBeDefined();
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
