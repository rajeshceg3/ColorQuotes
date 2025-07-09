import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GradientBackground from './index';
import * as motionUtils from '../../utils/motion'; // Import like this to mock specific functions
import { GradientService } from '../../services/GradientService';

// Mock the GradientService
jest.mock('../../services/GradientService');

const mockGradients = [
  { type: "linear", angle: "bg-gradient-to-br", colors: ["from-pink-300", "to-purple-300"] },
  { type: "linear", angle: "bg-gradient-to-r", colors: ["from-green-200", "to-blue-200"] },
  { type: "linear", angle: "bg-gradient-to-tl", colors: ["from-yellow-100", "to-orange-200"] },
];

describe('GradientBackground Component', () => {
  let getReducedMotionDurationMock: jest.SpyInstance;
  let mockGenerateGradient: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    // Mock GradientService implementation
    mockGenerateGradient = jest.fn()
      .mockReturnValueOnce(mockGradients[0])
      .mockReturnValueOnce(mockGradients[1])
      .mockReturnValue(mockGradients[2]);

    (GradientService.getInstance as jest.Mock).mockReturnValue({
      generateGradient: mockGenerateGradient,
    });

    (GradientService.formatGradientToTailwind as jest.Mock) = jest.fn(gradient => {
        if (!gradient) return '';
        return `${gradient.angle} ${gradient.colors.join(' ')}`;
    });

    // Mock getReducedMotionDuration
    getReducedMotionDurationMock = jest.spyOn(motionUtils, 'getReducedMotionDuration')
                                      .mockImplementation((duration: number) => duration);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('renders with an initial gradient', async () => {
    const testId = "content-div";
    render(<GradientBackground><div data-testid={testId}>Test Content</div></GradientBackground>);

    await act(async () => { jest.advanceTimersByTime(10); });

    const contentDiv = screen.getByTestId(testId);
    const bgDivParent = contentDiv.parentElement?.parentElement;
    const bg1 = bgDivParent?.children[0];

    expect(bg1).toHaveClass('bg-gradient-to-br', 'from-pink-300', 'to-purple-300');
    expect(bg1).toHaveStyle('opacity: 1');
  });

  test('changes gradient after interval', async () => {
    const testId = "content-div";
    render(<GradientBackground><div data-testid={testId}>Test Content</div></GradientBackground>);

    await act(async () => { jest.advanceTimersByTime(10); });

    const contentDiv = screen.getByTestId(testId);
    const bgDivParent = contentDiv.parentElement?.parentElement;
    const bg1 = bgDivParent?.children[0];
    const bg2 = bgDivParent?.children[1];

    await act(async () => {
      jest.advanceTimersByTime(15000);
    });

    expect(bg1).toHaveStyle('opacity: 0');
    expect(bg2).toHaveStyle('opacity: 1');
    expect(bg2).toHaveClass('bg-gradient-to-r', 'from-green-200', 'to-blue-200');
  });
});
