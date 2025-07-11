// src/services/QuoteService.test.ts
import { QuoteService } from './QuoteService';
import { LocalStorageService } from './LocalStorageService';
import { Quote, QuoteCategory } from '../types';

jest.mock('../data/quotes.json', () => ({
  quotes: [
    { id: '1', text: 'Quote 1', author: 'Author 1', category: 'motivational', source: 'Source 1', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag1'] },
    { id: '2', text: 'Quote 2', author: 'Author 2', category: 'wisdom', source: 'Source 2', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag2'] },
    { id: '3', text: 'Quote 3', author: 'Author 3', category: 'motivational', source: 'Source 3', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag3'] },
    { id: '4', text: 'Quote 4', author: 'Author 4', category: 'happiness', source: 'Source 4', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag4'] },
  ],
  metadata: {
    total_quotes: 4,
    last_updated: '2024-01-01T00:00:00Z',
    version: '1.0',
    categories: {
        'motivational': 2,
        'wisdom': 1,
        'happiness': 1,
        'creativity': 0,
        'leadership': 0,
        'perseverance': 0,
        'general': 0,
    }
  }
}));

const mockQuotes: Quote[] = [
  { id: '1', text: 'Quote 1', author: 'Author 1', category: QuoteCategory.MOTIVATIONAL, source: 'Source 1', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag1'] },
  { id: '2', text: 'Quote 2', author: 'Author 2', category: QuoteCategory.WISDOM, source: 'Source 2', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag2'] },
  { id: '3', text: 'Quote 3', author: 'Author 3', category: QuoteCategory.MOTIVATIONAL, source: 'Source 3', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag3'] },
  { id: '4', text: 'Quote 4', author: 'Author 4', category: QuoteCategory.HAPPINESS, source: 'Source 4', verified: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z', language: 'en', character_count: 10, tags: ['tag4'] },
];

// Mock LocalStorageService
jest.mock('./LocalStorageService');

describe('QuoteService', () => {
  let quoteService: QuoteService;
  let mockGetItem: jest.SpyInstance;
  let mockSetItem: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks for LocalStorageService before each test
    mockGetItem = jest.spyOn(LocalStorageService, 'getItem');
    mockSetItem = jest.spyOn(LocalStorageService, 'setItem');

    // Ensure a fresh instance of QuoteService for each test
    quoteService = QuoteService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears spy calls, but not mock implementations
  });

  describe('getRandomQuote', () => {
    it('should return a random quote', () => {
      mockGetItem.mockReturnValue({}); // No viewed quotes
      const quote = quoteService.getRandomQuote();
      expect(quote).not.toBeNull();
      expect(mockQuotes).toContainEqual(quote!);
    });

    it('should filter by category if provided', () => {
      mockGetItem.mockReturnValue({});
      const quote = quoteService.getRandomQuote(QuoteCategory.WISDOM);
      expect(quote).not.toBeNull();
      expect(quote?.category).toBe(QuoteCategory.WISDOM);
      expect(quote?.id).toBe('2'); // Only one wisdom quote
    });

    it('should not return a recently viewed quote', () => {
      const now = new Date();
      const recentlyViewed = {
        [mockQuotes[0].id]: new Date(now.getTime() - 1000).toISOString(), // Viewed 1 second ago
      };
      mockGetItem.mockReturnValue(recentlyViewed);

      // Run multiple times to increase chance of detecting non-exclusion
      for (let i = 0; i < 10; i++) {
        const quote = quoteService.getRandomQuote();
        expect(quote?.id).not.toBe(mockQuotes[0].id);
      }
    });

    it('should return a quote viewed longer than 24 hours ago', () => {
      const olderViewDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
      mockGetItem.mockReturnValue({ [mockQuotes[0].id]: olderViewDate });

      let foundOldQuote = false;
      for(let i=0; i<20; ++i) { // try multiple times
        const quote = quoteService.getRandomQuote();
        if(quote?.id === mockQuotes[0].id) {
          foundOldQuote = true;
          break;
        }
      }
      expect(foundOldQuote).toBe(true);
    });

    it('should update localStorage with the newly viewed quote', () => {
      mockGetItem.mockReturnValue({});
      const quote = quoteService.getRandomQuote();
      expect(quote).not.toBeNull();
      expect(mockSetItem).toHaveBeenCalled();
      const [key, value] = mockSetItem.mock.calls[0];
      expect(key).toBe('viewedQuotes');
      expect(value[quote!.id]).toBeDefined();
    });

    it('should reset viewed quotes for a category if all have been seen and return a quote', () => {
      // Mark all quotes in the 'motivational' category as recently viewed
      const now = new Date().toISOString();
      const viewedQuotes = {
        '1': now, // motivational
        '3': now, // motivational
      };
      mockGetItem.mockReturnValue(viewedQuotes);

      // Request a quote from the 'motivational' category
      const quote = quoteService.getRandomQuote(QuoteCategory.MOTIVATIONAL);

      // Expect that a quote is returned, because the viewed quotes for the category should be reset
      expect(quote).not.toBeNull();
      expect(quote?.category).toBe(QuoteCategory.MOTIVATIONAL);

      // Also, check that the setItem call was made to update the viewed quotes list,
      // reflecting the reset. The new list should contain only the newly selected quote.
      const [key, value] = mockSetItem.mock.calls[mockSetItem.mock.calls.length - 1];
      expect(key).toBe('viewedQuotes');
      expect(Object.keys(value).length).toBe(1);
      expect(value[quote!.id]).toBeDefined();
    });

     it('should clean up very old entries from localStorage', () => {
      const veryOldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(); // 8 days ago
      const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(); // 1 hour ago

      const viewedQuotes = {
        'veryOldId': veryOldDate,
        [mockQuotes[0].id]: recentDate
      };
      mockGetItem.mockReturnValue(viewedQuotes);

      const quote = quoteService.getRandomQuote(); // This will trigger cleanup
      expect(quote).not.toBeNull();

      const [key, value] = mockSetItem.mock.calls[0];
      expect(key).toBe('viewedQuotes');
      expect(value['veryOldId']).toBeUndefined(); // Should have been cleaned up
      expect(value[mockQuotes[0].id]).toBeDefined(); // Should still be there
      expect(value[quote!.id]).toBeDefined(); // Newly added quote
    });
  });

  describe('getQuoteById', () => {
    it('should return the correct quote by ID', () => {
      const quote = quoteService.getQuoteById('1');
      expect(quote).toEqual(mockQuotes[0]);
    });

    it('should return null if ID is not found', () => {
      const quote = quoteService.getQuoteById('nonExistentId');
      expect(quote).toBeNull();
    });
  });

  describe('getQuotes', () => {
    it('should return the specified number of quotes', () => {
      const quotes = quoteService.getQuotes(2);
      expect(quotes.length).toBe(2);
      expect(quotes[0]).toEqual(mockQuotes[0]);
      expect(quotes[1]).toEqual(mockQuotes[1]);
    });

    it('should filter by category if provided', () => {
      const quotes = quoteService.getQuotes(1, QuoteCategory.WISDOM);
      expect(quotes.length).toBe(1);
      expect(quotes[0].category).toBe(QuoteCategory.WISDOM);
      expect(quotes[0].id).toBe('2');
    });

    it('should return all quotes of a category if count is larger than available', () => {
      const quotes = quoteService.getQuotes(5, QuoteCategory.WISDOM);
      expect(quotes.length).toBe(1); // Only 1 wisdom quote in mock
      expect(quotes[0].id).toBe('2');
    });

    it('should return empty array if category has no quotes', () => {
      const quotes = quoteService.getQuotes(2, QuoteCategory.LEADERSHIP);
      expect(quotes.length).toBe(0);
    });
  });

  describe('getAllCategories', () => {
    it('should return all unique categories from the quotes', () => {
      const categories = quoteService.getAllCategories();
      expect(categories).toContain(QuoteCategory.MOTIVATIONAL);
      expect(categories).toContain(QuoteCategory.WISDOM);
      expect(categories).toContain(QuoteCategory.HAPPINESS);
      expect(categories.length).toBe(3); // Based on mockQuotes
    });
  });

  describe('Favorite Management', () => {
    const FAV_KEY = 'favoriteQuoteIds'; // Matches key in QuoteService

    it('getFavoriteQuoteIds should return an empty array if no favorites are set', () => {
      mockGetItem.mockReturnValue(null);
      const favIds = quoteService.getFavoriteQuoteIds();
      expect(favIds).toEqual([]);
      expect(mockGetItem).toHaveBeenCalledWith(FAV_KEY);
    });

    it('getFavoriteQuoteIds should return stored favorite IDs', () => {
      const storedFavs = ['1', '3'];
      mockGetItem.mockReturnValue(storedFavs);
      const favIds = quoteService.getFavoriteQuoteIds();
      expect(favIds).toEqual(storedFavs);
    });

    it('isQuoteFavorited should return true if quote ID is in favorites', () => {
      mockGetItem.mockReturnValue(['1', '3']);
      expect(quoteService.isQuoteFavorited('1')).toBe(true);
    });

    it('isQuoteFavorited should return false if quote ID is not in favorites', () => {
      mockGetItem.mockReturnValue(['1', '3']);
      expect(quoteService.isQuoteFavorited('2')).toBe(false);
    });

    it('isQuoteFavorited should return false if there are no favorites', () => {
      mockGetItem.mockReturnValue(null);
      expect(quoteService.isQuoteFavorited('1')).toBe(false);
    });

    it('addFavorite should add a quote ID to favorites', () => {
      mockGetItem.mockReturnValue(['1']); // Initial favorites
      quoteService.addFavorite('2');
      expect(mockSetItem).toHaveBeenCalledWith(FAV_KEY, ['1', '2']);
    });

    it('addFavorite should not add a duplicate quote ID', () => {
      mockGetItem.mockReturnValue(['1', '2']);
      quoteService.addFavorite('1');
      // setItem should not be called if no change, or called with same array
      // Current implementation fetches, modifies, then sets. So it will be called.
      expect(mockSetItem).toHaveBeenCalledWith(FAV_KEY, ['1', '2']);
      // A stricter test might check if LocalStorageService.setItem was called with the exact same array object
      // or if it was called an expected number of times.
      // The current check is fine: it ensures the list remains correct.
    });

    it('addFavorite should create a new list if no favorites existed', () => {
      mockGetItem.mockReturnValue(null);
      quoteService.addFavorite('newFav');
      expect(mockSetItem).toHaveBeenCalledWith(FAV_KEY, ['newFav']);
    });

    it('removeFavorite should remove a quote ID from favorites', () => {
      mockGetItem.mockReturnValue(['1', '2', '3']);
      quoteService.removeFavorite('2');
      expect(mockSetItem).toHaveBeenCalledWith(FAV_KEY, ['1', '3']);
    });

    it('removeFavorite should do nothing if quote ID is not in favorites', () => {
      mockGetItem.mockReturnValue(['1', '3']);
      quoteService.removeFavorite('2');
      // setItem should not be called if the list wasn't modified.
      // Similar to addFavorite, current implementation will call setItem with the same list.
       expect(mockSetItem).toHaveBeenCalledWith(FAV_KEY, ['1', '3']);
    });

    it('removeFavorite should do nothing if favorites list is empty', () => {
        mockGetItem.mockReturnValue([]);
        quoteService.removeFavorite('1');
        expect(mockSetItem).toHaveBeenCalledWith(FAV_KEY, []);
    });
  });
});
