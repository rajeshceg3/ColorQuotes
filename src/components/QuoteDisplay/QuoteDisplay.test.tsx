import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteDisplay from './index';
import * as motionUtils from '../../utils/motion'; // Import like this to mock specific functions

// Mock the quote data to have a controlled set for testing
const mockQuotes = [
  { id: '1', text: 'Test Quote 1', author: 'Author 1', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test' },
  { id: '2', text: 'Test Quote 2', author: 'Author 2', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test' },
  { id: '3', text: 'Test Quote 3', author: 'Author 3', category: 'wisdom', character_count: 10, tags:[], verified: true, source: 'test' },
];

// Mock the imported JSON data
jest.mock('../../data/quotes.json', () => ({
  quotes: mockQuotes,
  metadata: { total_quotes: mockQuotes.length, last_updated: "2024-01-01", version: "1.0" }
}), { virtual: true });


describe('QuoteDisplay Component', () => {
  let getReducedMotionDurationMock: jest.SpyInstance;
  let matchMediaMock: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    // Mock Math.random for predictable quote selection
    jest.spyOn(Math, 'random').mockReturnValue(0); // Always pick the first quote initially

    // Mock getReducedMotionDuration
    getReducedMotionDurationMock = jest.spyOn(motionUtils, 'getReducedMotionDuration')
                                      .mockImplementation((duration: number) => duration);

    // Define a default mock for window.matchMedia
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });

    matchMediaMock = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
        matches: false, // Default to no reduced motion
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks(); // Restore Math.random and other mocks
  });

  test('renders loading message initially then a quote', async () => {
    render(<QuoteDisplay />);
    // The component initially renders null for currentQuote, then useEffect sets it.
    // The loading message "Loading inspiration..." is shown when !currentQuote && isQuoteVisible && !isAnimatingRef.current.
    // The very first state might be loading, then it quickly sets a quote.
    // We need to advance timers to allow the initial quote selection and animation setup to complete.

    // Expect loading initially if possible to catch, otherwise proceed to check for quote
    // Depending on timing, "Loading" might be too fast. The key is the final state.

    await act(async () => {
        jest.advanceTimersByTime(10); // Allow initial state set, small delay for effects
    });

    expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();
    expect(screen.getByText(`- ${mockQuotes[0].author}`)).toBeInTheDocument();
  });

  test('displays a new quote on click', async () => {
    render(<QuoteDisplay />);
    await act(async () => { jest.advanceTimersByTime(10); }); // Initial load

    const firstQuoteText = screen.getByText(`"${mockQuotes[0].text}"`);
    expect(firstQuoteText).toBeInTheDocument();

    // Change Math.random to select the second quote (index 1)
    jest.spyOn(Math, 'random').mockReturnValue(1 / mockQuotes.length);

    fireEvent.click(screen.getByRole('button', { name: /Display next quote/i }));

    await act(async () => {
      // BASE_QUOTE_FADE_DURATION is 800ms in component
      jest.advanceTimersByTime(800 + 50); // Allow fade duration + buffer
    });

    expect(screen.getByText(`"${mockQuotes[1].text}"`)).toBeInTheDocument();
    // Check if the old quote text is gone
    expect(screen.queryByText(`"${mockQuotes[0].text}"`)).not.toBeInTheDocument();
  });

  test('displays a new quote with keyboard (Enter key)', async () => {
    render(<QuoteDisplay />);
    await act(async () => { jest.advanceTimersByTime(10); });

    jest.spyOn(Math, 'random').mockReturnValue(1 / mockQuotes.length); // for second quote

    fireEvent.keyPress(screen.getByRole('button', { name: /Display next quote/i }), { key: 'Enter', code: 'Enter', charCode: 13 });
    await act(async () => { jest.advanceTimersByTime(800 + 50); });
    expect(screen.getByText(`"${mockQuotes[1].text}"`)).toBeInTheDocument();
  });

  test('rotates quote automatically after interval', async () => {
    render(<QuoteDisplay />);
    await act(async () => { jest.advanceTimersByTime(10); });
    expect(screen.getByText(`"${mockQuotes[0].text}"`)).toBeInTheDocument();

    jest.spyOn(Math, 'random').mockReturnValue(1 / mockQuotes.length); // For next quote

    await act(async () => {
      jest.advanceTimersByTime(30000); // QUOTE_ROTATION_INTERVAL
      jest.advanceTimersByTime(800 + 50); // Animation
    });

    expect(screen.getByText(`"${mockQuotes[1].text}"`)).toBeInTheDocument();
  });

  test('manual navigation resets automatic rotation timer', async () => {
    render(<QuoteDisplay />);
    await act(async () => { jest.advanceTimersByTime(10); }); // Initial load
    const initialQuoteText = mockQuotes[0].text;
    expect(screen.getByText(`"${initialQuoteText}"`)).toBeInTheDocument();

    // Simulate time passing, but not enough for full auto-rotation
    await act(async () => { jest.advanceTimersByTime(15000); });

    // Manually change quote
    jest.spyOn(Math, 'random').mockReturnValue(1 / mockQuotes.length); // For manual change to quote 1
    fireEvent.click(screen.getByRole('button', { name: /Display next quote/i }));
    await act(async () => { jest.advanceTimersByTime(800 + 50); });
    const quoteAfterManualChangeText = mockQuotes[1].text;
    expect(screen.getByText(`"${quoteAfterManualChangeText}"`)).toBeInTheDocument();

    // Set Math.random for the *next* auto-rotation (to quote 2)
    jest.spyOn(Math, 'random').mockReturnValue(2 / mockQuotes.length);

    // Advance timer by less than full interval from *now* - should not change yet if timer reset
    await act(async () => { jest.advanceTimersByTime(29000); }); // Just under 30s
    await act(async () => { jest.advanceTimersByTime(800 + 50); }); // Animation time if it were to change
    expect(screen.getByText(`"${quoteAfterManualChangeText}"`)).toBeInTheDocument(); // Still the manually selected quote

    // Advance timer past the reset interval (additional >1s to complete 30s for timer + animation)
    await act(async () => { jest.advanceTimersByTime(1000 + 800 + 50); });
    expect(screen.getByText(`"${mockQuotes[2].text}"`)).toBeInTheDocument();
  });

  test('renders with reduced motion if preferred', async () => {
    // Override the specific window.matchMedia mock for this test
    matchMediaMock.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(),
        addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn(),
    }));

    // Re-mock getReducedMotionDuration to return 0 when reduced motion is on
    getReducedMotionDurationMock.mockImplementation((duration: number) => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        return mediaQuery.matches ? 0 : duration;
    });


    render(<QuoteDisplay />);
    await act(async () => { jest.advanceTimersByTime(10); });

    const quoteElementContainer = screen.getByText(`"${mockQuotes[0].text}"`).closest('div[aria-live="polite"]');
    expect(quoteElementContainer).toHaveStyle('transition: opacity 0ms ease-in-out');
  });

  test('has correct ARIA attributes', async () => {
    render(<QuoteDisplay />);
    await act(async () => { jest.advanceTimersByTime(10); });

    const button = screen.getByRole('button', { name: /Display next quote/i });
    expect(button).toBeInTheDocument();

    const liveRegion = screen.getByText(`"${mockQuotes[0].text}"`).closest('div[aria-live="polite"]');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  // New tests for Copy Quote Modal
  describe('Copy Quote Modal Functionality', () => {
    const initialQuote = mockQuotes[0];
    const expectedCopiedText = `"${initialQuote.text}" - ${initialQuote.author}`;

    beforeEach(async () => {
      // Ensure component is rendered and initial quote is set
      render(<QuoteDisplay />);
      await act(async () => { jest.advanceTimersByTime(10); }); // For initial quote
    });

    test('opens copy modal with correct content and calls clipboard', async () => {
      const copyButton = screen.getByRole('button', { name: /Copy quote and author/i });
      fireEvent.click(copyButton);

      await screen.findByRole('dialog'); // Wait for modal to appear

      expect(screen.getByText('Quote Copied to Clipboard!')).toBeInTheDocument();
      expect(screen.getByText(expectedCopiedText)).toBeInTheDocument();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedCopiedText);
    });

    test('closes copy modal when OK button is clicked', async () => {
      const copyButton = screen.getByRole('button', { name: /Copy quote and author/i });
      fireEvent.click(copyButton);
      await screen.findByRole('dialog'); // Modal appears

      const okButton = screen.getByRole('button', { name: /OK/i });
      fireEvent.click(okButton);

      await act(async () => { jest.advanceTimersByTime(10); }); // Allow state update
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('closes copy modal when Escape key is pressed', async () => {
      const copyButton = screen.getByRole('button', { name: /Copy quote and author/i });
      fireEvent.click(copyButton);
      await screen.findByRole('dialog'); // Modal appears

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await act(async () => { jest.advanceTimersByTime(10); }); // Allow state update
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('closes copy modal when overlay is clicked', async () => {
      const copyButton = screen.getByRole('button', { name: /Copy quote and author/i });
      fireEvent.click(copyButton);

      const dialog = await screen.findByRole('dialog'); // Modal appears
      // The overlay is the dialog element itself in this implementation for click handling
      fireEvent.click(dialog);

      await act(async () => { jest.advanceTimersByTime(10); });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('focus is moved to OK button when modal opens', async () => {
      const copyButton = screen.getByRole('button', { name: /Copy quote and author/i });
      fireEvent.click(copyButton);
      await screen.findByRole('dialog');

      const okButton = screen.getByRole('button', { name: /OK/i });
      expect(okButton).toHaveFocus();
    });
  });
});
