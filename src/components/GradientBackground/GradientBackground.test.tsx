import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GradientBackground from './index';
import { GradientService } from '../../services/GradientService';
import { usePageVisibility } from '../../utils/usePageVisibility';

// Mock the services and hooks
jest.mock('../../services/GradientService');
jest.mock('../../utils/usePageVisibility');

const mockedGradientService = GradientService as jest.Mocked<typeof GradientService>;
const mockedUsePageVisibility = usePageVisibility as jest.Mock;

const mockGradients = [
  { type: "linear", angle: "bg-gradient-to-br", colors: ["from-pink-300", "to-purple-300"] },
  { type: "linear", angle: "bg-gradient-to-r", colors: ["from-green-200", "to-blue-200"] },
  { type: "linear", angle: "bg-gradient-to-t", colors: ["from-yellow-200", "to-red-200"] },
];

describe('GradientBackground Component', () => {

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Mock page visibility to be true by default
    mockedUsePageVisibility.mockReturnValue(true);

    const mockGenerateGradient = jest.fn()
      .mockReturnValueOnce(mockGradients[0]) // Initial bg1
      .mockReturnValueOnce(mockGradients[1]) // Initial bg2
      .mockReturnValue(mockGradients[2]);   // Subsequent calls

    // Mock the static format method
    (mockedGradientService.formatGradientToTailwind as jest.Mock).mockImplementation(
      (g) => g ? `${g.angle} ${g.colors.join(' ')}` : ''
    );

    // Mock the getInstance method to return a promise that resolves to a mock instance
    (mockedGradientService.getInstance as jest.Mock).mockResolvedValue({
      generateGradient: mockGenerateGradient,
      formatGradientToTailwind: mockedGradientService.formatGradientToTailwind,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders the initial gradient after the service loads', async () => {
    render(<GradientBackground><div>Test</div></GradientBackground>);

    await waitFor(() => {
      const bg1 = screen.getByTestId('gradient-bg-1');
      expect(bg1).toHaveClass('bg-gradient-to-br from-pink-300 to-purple-300');
    });

    const bg2 = screen.getByTestId('gradient-bg-2');
    expect(bg2).toHaveClass('bg-gradient-to-r from-green-200 to-blue-200');
  });

  test('changes to the next gradient after the interval', async () => {
    render(<GradientBackground><div>Test</div></GradientBackground>);

    // Wait for the initial state to be fully rendered
    await waitFor(() => {
      const bg1 = screen.getByTestId('gradient-bg-1');
      expect(bg1).toHaveClass('from-pink-300');
    });

    // Advance the timer to trigger gradient change
    act(() => {
      jest.advanceTimersByTime(15000);
    });

    // The component logic swaps the active index and updates the *other* background
    // So bg2 should get the new gradient and become active
    await waitFor(() => {
      const bg2 = screen.getByTestId('gradient-bg-2');
      expect(bg2).toHaveClass('bg-gradient-to-t from-yellow-200 to-red-200');
    });
  });

  test('does not change gradient when page is not visible', async () => {
    // Set page visibility to false for this test
    mockedUsePageVisibility.mockReturnValue(false);

    render(<GradientBackground><div>Test</div></GradientBackground>);

    await waitFor(() => {
      const bg1 = screen.getByTestId('gradient-bg-1');
      expect(bg1).toHaveClass('from-pink-300');
    });

    // Try to advance the timer
    act(() => {
      jest.advanceTimersByTime(15000);
    });

    // The gradient should NOT have changed
    const bg1 = screen.getByTestId('gradient-bg-1');
    expect(bg1).not.toHaveClass('from-yellow-200');
    expect(bg1).toHaveClass('from-pink-300');
  });
});
