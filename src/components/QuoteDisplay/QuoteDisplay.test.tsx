import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteDisplay from './index';
import { QuoteService } from '../../services/QuoteService';
import { Quote } from '../../types';
import { usePageVisibility } from '../../utils/usePageVisibility';

// Mock the services and hooks
jest.mock('../../services/QuoteService');
jest.mock('../../utils/usePageVisibility');

const mockedQuoteService = QuoteService as jest.Mocked<typeof QuoteService>;
const mockedUsePageVisibility = usePageVisibility as jest.Mock;

const mockQuotes: Quote[] = [
  { id: '1', text: 'Mock Quote 1', author: 'Mock Author 1', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test', created_at: '', updated_at: '', language: 'en' },
  { id: '2', text: 'Mock Quote 2', author: 'Mock Author 2', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test', created_at: '', updated_at: '', language: 'en' },
];

const BASE_QUOTE_FADE_DURATION = 1200;

describe('QuoteDisplay Component', () => {

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockedUsePageVisibility.mockReturnValue(true);

    // Default successful mock
    const mockGetInstance = () => Promise.resolve({
      getRandomQuote: jest.fn()
        .mockReturnValueOnce(mockQuotes[0])
        .mockReturnValue(mockQuotes[1]),
      isQuoteFavorited: jest.fn().mockReturnValue(false),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      resetViewedQuotes: jest.fn(),
    });

    (mockedQuoteService.getInstance as jest.Mock).mockImplementation(mockGetInstance);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders loading and then the initial quote', async () => {
    render(<QuoteDisplay />);
    expect(screen.getByText(/Loading quotes.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();
    });
  });

  test('displays a new quote on click after fade animation', async () => {
    render(<QuoteDisplay />);
    await waitFor(() => expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument());

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Display next quote/i }));
      // Fast-forward through the fade-out and fade-in animation
      jest.advanceTimersByTime(BASE_QUOTE_FADE_DURATION);
    });

    await waitFor(() => {
      expect(screen.getByText(`"${mockQuotes[1].text}"`)).toBeInTheDocument();
    });
  });

  test('shows an error message if the service fails to load', async () => {
    // Override the mock for this specific test
    (mockedQuoteService.getInstance as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    render(<QuoteDisplay />);

    await waitFor(() => {
      expect(screen.getByText(/Could not load quotes/i)).toBeInTheDocument();
    });
  });

  test('shows "all quotes seen" toast and resets', async () => {
    // Mock getRandomQuote to return null on the second call
    const mockGetInstance = () => Promise.resolve({
      getRandomQuote: jest.fn()
        .mockReturnValueOnce(mockQuotes[0]) // First call is successful
        .mockReturnValueOnce(null)          // Second call returns null
        .mockReturnValue(mockQuotes[0]),    // Third call after reset
      isQuoteFavorited: jest.fn().mockReturnValue(false),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      resetViewedQuotes: jest.fn(),
    });
    (mockedQuoteService.getInstance as jest.Mock).mockImplementation(mockGetInstance);

    render(<QuoteDisplay />);
    await waitFor(() => expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument());

    // Click to trigger the change
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Display next quote/i }));
      jest.advanceTimersByTime(BASE_QUOTE_FADE_DURATION);
    });

    // Check for the toast message
    await waitFor(() => {
      expect(screen.getByText(/You've seen all quotes!/i)).toBeInTheDocument();
    });

    // And check that the quote has reset to the first one
    await waitFor(() => {
        expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();
    });
  });
});
