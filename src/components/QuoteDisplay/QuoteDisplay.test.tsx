import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteDisplay from './index';
import { QuoteService } from '../../services/QuoteService';
import { Quote } from '../../types';

jest.mock('../../services/QuoteService');
const mockedQuoteService = QuoteService as jest.Mocked<typeof QuoteService>;

const mockQuotes: Quote[] = [
  { id: '1', text: 'Mock Quote 1', author: 'Mock Author 1', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test', created_at: '', updated_at: '', language: 'en' },
  { id: '2', text: 'Mock Quote 2', author: 'Mock Author 2', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test', created_at: '', updated_at: '', language: 'en' },
];

describe('QuoteDisplay Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    const mockGetRandomQuote = jest.fn()
      .mockReturnValueOnce(mockQuotes[0])
      .mockReturnValue(mockQuotes[1]);

    (mockedQuoteService.getInstance as jest.Mock).mockResolvedValue({
      getRandomQuote: mockGetRandomQuote,
      isQuoteFavorited: jest.fn().mockReturnValue(false),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
    });
  });

  test('renders loading and then the initial quote', async () => {
    render(<QuoteDisplay />);
    expect(screen.getByText(/Loading quotes.../i)).toBeInTheDocument();

    expect(await screen.findByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();
  });

  test('displays a new quote on click', async () => {
    render(<QuoteDisplay />);
    await screen.findByText(`"${mockQuotes[0].text}"`);

    fireEvent.click(screen.getByRole('button', { name: /Display next quote/i }));

    // We need to wait for the state update to propagate and the new quote to be rendered
    await waitFor(() => {
      expect(screen.getByText(`"${mockQuotes[1].text}"`)).toBeInTheDocument();
    });
  });
});
