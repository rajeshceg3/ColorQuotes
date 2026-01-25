import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteDisplay from '../index';
import { QuoteService } from '../../../services/QuoteService';
import { Quote } from '../../../types';
import { usePageVisibility } from '../../../utils/usePageVisibility';

// Mock the services and hooks
jest.mock('../../../services/QuoteService');
jest.mock('../../../utils/usePageVisibility');

const mockedQuoteService = QuoteService as jest.Mocked<typeof QuoteService>;
const mockedUsePageVisibility = usePageVisibility as jest.Mock;

const mockQuotes: Quote[] = [
  { id: '1', text: 'Mock Quote 1', author: 'Mock Author 1', category: 'wisdom' },
  { id: '2', text: 'Mock Quote 2', author: 'Mock Author 2', category: 'wisdom' },
];

const BASE_QUOTE_FADE_DURATION = 1200;

// Mock clipboard
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
  share: jest.fn(),
});

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
    await waitFor(() => {
      expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();
    });
  });

  test('displays a new quote on click after fade animation', async () => {
    render(<QuoteDisplay />);
    await waitFor(() => expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument());

    act(() => {
        const displayArea = screen.getByLabelText(/Display next quote/i);
        fireEvent.click(displayArea);
        jest.advanceTimersByTime(BASE_QUOTE_FADE_DURATION);
    });

    await waitFor(() => {
      expect(screen.getByText(`"${mockQuotes[1].text}"`)).toBeInTheDocument();
    });
  });

  test('shows an error message if the service fails to load', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (mockedQuoteService.getInstance as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    render(<QuoteDisplay />);
    await waitFor(() => {
      expect(screen.getByText(/Could not load quotes/i)).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  test('shows "all quotes seen" toast and resets', async () => {
    const mockGetInstance = () => Promise.resolve({
      getRandomQuote: jest.fn()
        .mockReturnValueOnce(mockQuotes[0])
        .mockReturnValueOnce(null)
        .mockReturnValue(mockQuotes[0]),
      isQuoteFavorited: jest.fn().mockReturnValue(false),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      resetViewedQuotes: jest.fn(),
    });
    (mockedQuoteService.getInstance as jest.Mock).mockImplementation(mockGetInstance);

    render(<QuoteDisplay />);
    await waitFor(() => expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument());

    act(() => {
      const displayArea = screen.getByLabelText(/Display next quote/i);
      fireEvent.click(displayArea);
      jest.advanceTimersByTime(BASE_QUOTE_FADE_DURATION);
    });

    await waitFor(() => {
      expect(screen.getByText(/Cycle complete/i)).toBeInTheDocument();
    });

    await waitFor(() => {
        expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();
    });
  });

  test('handles favorite toggle', async () => {
      const addFavoriteMock = jest.fn();
      const mockGetInstance = () => Promise.resolve({
          getRandomQuote: jest.fn().mockReturnValue(mockQuotes[0]),
          isQuoteFavorited: jest.fn().mockReturnValue(false),
          addFavorite: addFavoriteMock,
          removeFavorite: jest.fn(),
          resetViewedQuotes: jest.fn(),
      });
      (mockedQuoteService.getInstance as jest.Mock).mockImplementation(mockGetInstance);

      render(<QuoteDisplay />);
      await waitFor(() => screen.getByText(`"${mockQuotes[0].text}"`));

      const favoriteBtns = screen.getAllByLabelText(/Favorite/i);

      act(() => {
          fireEvent.click(favoriteBtns[0]);
      });

      expect(addFavoriteMock).toHaveBeenCalledWith(mockQuotes[0].id);

      await waitFor(() => {
          expect(screen.getByText(/Added to favorites/i)).toBeInTheDocument();
      });
  });

  test('handles copy to clipboard', async () => {
      render(<QuoteDisplay />);
      await waitFor(() => screen.getByText(`"${mockQuotes[0].text}"`));

      const copyBtns = screen.getAllByLabelText(/Copy quote/i);

      act(() => {
          fireEvent.click(copyBtns[0]);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`"${mockQuotes[0].text}" — ${mockQuotes[0].author}`);
      await waitFor(() => {
          expect(screen.getByText(/Copied to clipboard/i)).toBeInTheDocument();
      });
  });
});
