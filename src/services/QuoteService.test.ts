// src/services/QuoteService.test.ts

// We need to test the real service, not the mock.
jest.unmock('./QuoteService');

import { QuoteService } from './QuoteService';
import { LocalStorageService } from './LocalStorageService';

const mockQuotesData = {
  quotes: [
    { id: '1', text: 'Quote 1', author: 'Author 1', category: 'motivational' },
    { id: '2', text: 'Quote 2', author: 'Author 2', category: 'wisdom' },
    { id: '3', text: 'Quote 3', author: 'Author 3', category: 'motivational' },
  ],
};

// Mock the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockQuotesData),
  })
) as jest.Mock;

// Mock LocalStorageService
jest.mock('./LocalStorageService');

describe('QuoteService (Real Implementation)', () => {
  let quoteService: QuoteService;
  let mockGetItem: jest.SpyInstance;
  let mockSetItem: jest.SpyInstance;

  beforeEach(async () => {
    // Reset singleton instance before each test to ensure clean state
    (QuoteService as any).instance = null;

    mockGetItem = jest.spyOn(LocalStorageService, 'getItem');
    mockSetItem = jest.spyOn(LocalStorageService, 'setItem');
    (global.fetch as jest.Mock).mockClear();

    quoteService = await QuoteService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and process quotes during initialization', async () => {
    expect(global.fetch).toHaveBeenCalledWith('/api/quotes');
    // Test that the service has processed the quotes
    const quote = quoteService.getQuoteById('1');
    expect(quote).toBeDefined();
    expect(quote?.category).toBe('motivational');
  });

  describe('getRandomQuote', () => {
    it('should not return a recently viewed quote', () => {
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5); // Pick the middle element

      const now = new Date();
      const recentlyViewed = { '1': new Date(now.getTime() - 1000).toISOString() };
      mockGetItem.mockReturnValue(recentlyViewed);

      // Available quotes are '2' and '3'. 0.5 * 2 = 1. So it should pick '3'.
      const quote = quoteService.getRandomQuote();
      expect(quote?.id).not.toBe('1');
      expect(quote?.id).toBe('3');

      randomSpy.mockRestore();
    });
  });

  describe('Favorite Management', () => {
    it('addFavorite should add a quote ID to favorites', () => {
      mockGetItem.mockReturnValue(['1']);
      quoteService.addFavorite('2');
      expect(mockSetItem).toHaveBeenCalledWith('favoriteQuoteIds', ['1', '2']);
    });

    it('removeFavorite should remove a quote ID from favorites', () => {
      mockGetItem.mockReturnValue(['1', '2', '3']);
      quoteService.removeFavorite('2');
      expect(mockSetItem).toHaveBeenCalledWith('favoriteQuoteIds', ['1', '3']);
    });
  });
});
