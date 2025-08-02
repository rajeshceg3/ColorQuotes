import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GradientBackground from './index';
import { GradientService } from '../../services/GradientService';

jest.mock('../../services/GradientService');
const mockedGradientService = GradientService as jest.Mocked<typeof GradientService>;

const mockGradients = [
  { type: "linear", angle: "bg-gradient-to-br", colors: ["from-pink-300", "to-purple-300"] },
  { type: "linear", angle: "bg-gradient-to-r", colors: ["from-green-200", "to-blue-200"] },
];

describe('GradientBackground Component', () => {

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    const mockGenerateGradient = jest.fn()
      .mockReturnValueOnce(mockGradients[0])
      .mockReturnValueOnce(mockGradients[1]);

    (mockedGradientService.getInstance as jest.Mock).mockResolvedValue({
      generateGradient: mockGenerateGradient,
    });

    (mockedGradientService.formatGradientToTailwind as jest.Mock).mockImplementation(
      (g) => g ? `${g.angle} ${g.colors.join(' ')}` : ''
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders the initial gradient after the service loads', async () => {
    render(<GradientBackground><div>Test</div></GradientBackground>);

    const bg1 = await screen.findByTestId('gradient-bg-1');
    expect(bg1).toHaveClass('bg-gradient-to-br from-pink-300 to-purple-300');
  });

  test('changes to the next gradient after the interval', async () => {
    render(<GradientBackground><div>Test</div></GradientBackground>);

    // Wait for the initial state
    const bg1 = await screen.findByTestId('gradient-bg-1');
    await waitFor(() => expect(bg1).toHaveClass('from-pink-300'));

    // Advance the timer
    act(() => {
      jest.advanceTimersByTime(15000);
    });

    // Check that the second background is now active
    const bg2 = screen.getByTestId('gradient-bg-2');
    await waitFor(() => {
      expect(bg2).toHaveClass('bg-gradient-to-r from-green-200 to-blue-200');
    });
  });
});
