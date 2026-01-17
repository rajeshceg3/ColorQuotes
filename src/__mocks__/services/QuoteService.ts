/* eslint-disable @typescript-eslint/no-explicit-any */
// src/__mocks__/services/QuoteService.ts

// This is the mock implementation for the QuoteService.
// Jest will automatically use this file whenever QuoteService is imported in a test.

// Create a mock function for each method on the service instance
const mockGetRandomQuote = jest.fn();
const mockGetQuoteById = jest.fn();
const mockGetAllCategories = jest.fn();
const mockIsQuoteFavorited = jest.fn();
const mockAddFavorite = jest.fn();
const mockRemoveFavorite = jest.fn();

// Create a mock for the service instance itself
const mockServiceInstance = {
  getRandomQuote: mockGetRandomQuote,
  getQuoteById: mockGetQuoteById,
  getAllCategories: mockGetAllCategories,
  isQuoteFavorited: mockIsQuoteFavorited,
  addFavorite: mockAddFavorite,
  removeFavorite: mockRemoveFavorite,
};

// Mock the static getInstance method to return a promise that resolves with the mock instance
const mockGetInstance = jest.fn().mockResolvedValue(mockServiceInstance);

// The class mock
const QuoteService = jest.fn().mockImplementation(() => {
  return mockServiceInstance;
});

// Attach the static method mock to the class mock
(QuoteService as any).getInstance = mockGetInstance;


// Export the mocked class
export { QuoteService };

// It can also be useful to export the individual method mocks to reset them in tests
export const __QuoteServiceMocks = {
  mockGetInstance,
  mockGetRandomQuote,
  mockGetQuoteById,
  mockGetAllCategories,
  mockIsQuoteFavorited,
  mockAddFavorite,
  mockRemoveFavorite,
};
