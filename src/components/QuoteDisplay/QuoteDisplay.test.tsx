import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteDisplay from './index';
import * as motionUtils from '../../utils/motion'; // Import like this to mock specific functions
import { QuoteService } from '../../services/QuoteService';

const mockGetRandomQuote = jest.fn();
// Mock the QuoteService
jest.mock('../../services/QuoteService', () => ({
  QuoteService: {
    getInstance: () => ({
      getRandomQuote: mockGetRandomQuote,
      isQuoteFavorited: jest.fn().mockReturnValue(false),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
    }),
  },
}));

const mockQuotes = [
  { id: '1', text: 'Test Quote 1', author: 'Author 1', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test' },
  { id: '2', text: 'Test Quote 2', author: 'Author 2', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test' },
  { id: '3', text: 'Test Quote 3', author: 'Author 3', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test' },
];

describe('QuoteDisplay Component', () => {
  let getReducedMotionDurationMock: jest.SpyInstance;
  let matchMediaMock: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    // Reset mock for each test
    mockGetRandomQuote.mockClear()
      .mockReturnValueOnce(mockQuotes[0])
      .mockReturnValueOnce(mockQuotes[1])
      .mockReturnValue(mockQuotes[2]);

    // Mock getReducedMotionDuration
    getReducedMotionDurationMock = jest.spyOn(motionUtils, 'getReducedMotionDuration')
                                      .mockImplementation((duration: number) => duration);

    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('renders a quote', async () => {
    render(<QuoteDisplay />);
    await act(async () => {
        jest.advanceTimersByTime(10);
    });
    expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();
    expect(screen.getByText(`- ${mockQuotes[0].author}`)).toBeInTheDocument();
  });

  test('displays a new quote on click', async () => {
    render(<QuoteDisplay />);
    await act(async () => { jest.advanceTimersByTime(10); });

    fireEvent.click(screen.getByRole('button', { name: /Display next quote/i }));

    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(screen.getByText(`"${mockQuotes[1].text}"`)).toBeInTheDocument();
    expect(screen.queryByText(`"${mockQuotes[0].text}"`)).not.toBeInTheDocument();
  });
});
