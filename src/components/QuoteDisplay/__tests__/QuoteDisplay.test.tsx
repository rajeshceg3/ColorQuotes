import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuoteDisplay from '../index';
import { QuoteService } from '../../../services/QuoteService';

// Mock the dependencies
jest.mock('../../../services/QuoteService');
jest.mock('../../../utils/usePageVisibility', () => ({
  usePageVisibility: () => true,
}));

// Mock clipboard
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
  share: jest.fn(),
});

describe('QuoteDisplay', () => {
  const mockQuote = {
    id: '1',
    text: 'Test Quote',
    author: 'Test Author',
    category: 'Test',
  };

  const mockQuoteService = {
    getRandomQuote: jest.fn().mockReturnValue(mockQuote),
    isQuoteFavorited: jest.fn().mockReturnValue(false),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    resetViewedQuotes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (QuoteService.getInstance as jest.Mock).mockResolvedValue(mockQuoteService);
  });

  it('renders the initial quote', async () => {
    render(<QuoteDisplay />);

    await waitFor(() => {
      expect(screen.getByText('Test Quote')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });
  });

  it('handles favorite toggle', async () => {
    render(<QuoteDisplay />);

    await waitFor(() => screen.getByText('Test Quote'));

    const favoriteBtn = screen.getByTitle('Add to Favorites');
    fireEvent.click(favoriteBtn);

    expect(mockQuoteService.addFavorite).toHaveBeenCalledWith('1');

    // UI update might be optimistic, but here we mock the service logic
    // We expect the button title to change if we were testing internal state updates that rely on service.
    // However, our component updates local state immediately.

    await waitFor(() => {
        expect(screen.getByText('Added to Favorites')).toBeInTheDocument();
    });
  });

  it('handles copy to clipboard', async () => {
    render(<QuoteDisplay />);
    await waitFor(() => screen.getByText('Test Quote'));

    const copyBtn = screen.getByTitle('Copy to Clipboard');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('"Test Quote" — Test Author');
    await waitFor(() => {
        expect(screen.getByText('Copied to Clipboard')).toBeInTheDocument();
    });
  });
});
