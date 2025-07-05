import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GradientBackground from './index';
import * as motionUtils from '../../utils/motion'; // Import like this to mock specific functions


const mockGradients = [
  { type: "linear", angle: "bg-gradient-to-br", colors: ["from-pink-300", "to-purple-300"] },
  { type: "linear", angle: "bg-gradient-to-r", colors: ["from-green-200", "to-blue-200"] },
  { type: "linear", angle: "bg-gradient-to-tl", colors: ["from-yellow-100", "to-orange-200"] }, // Third for variety
];

jest.mock('../../data/gradients.json', () => ({
  gradients: mockGradients
}), { virtual: true });

describe('GradientBackground Component', () => {
  let getReducedMotionDurationMock: jest.SpyInstance;
  let matchMediaMock: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0); // Always pick first gradient for initial

    getReducedMotionDurationMock = jest.spyOn(motionUtils, 'getReducedMotionDuration')
                                      .mockImplementation((duration: number) => duration);

    matchMediaMock = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
        matches: false, // Default to no reduced motion
        media: query,
        onchange: null,
        addListener: jest.fn(), removeListener: jest.fn(),
        addEventListener: jest.fn(), removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('renders with an initial gradient', async () => {
    const testId = "content-div";
    render(<GradientBackground><div data-testid={testId}>Test Content</div></GradientBackground>);

    // Allow initial useEffect to run
    await act(async () => { jest.advanceTimersByTime(10); });

    const contentDiv = screen.getByTestId(testId);
    // The gradient divs are siblings to the content's parent wrapper.
    // Structure: root -> [bgDiv1, bgDiv2, contentWrapperDiv -> contentDiv]
    const contentWrapperDiv = contentDiv.parentElement;
    const bgDivParent = contentWrapperDiv?.parentElement;
    const bg1 = bgDivParent?.children[0];
    const bg2 = bgDivParent?.children[1];


    expect(bg1).toHaveClass(mockGradients[0].angle);
    mockGradients[0].colors.forEach(colorClass => expect(bg1).toHaveClass(colorClass));
    expect(bg1).toHaveStyle('opacity: 1');

    // bg2 should be preloaded but invisible
    expect(bg2).toHaveClass(mockGradients[1].angle); // Assuming Math.random was 0 then 1/length for preloading next
    mockGradients[1].colors.forEach(colorClass => expect(bg2).toHaveClass(colorClass));
    expect(bg2).toHaveStyle('opacity: 0');
  });


  test('changes gradient after interval', async () => {
    const testId = "content-div";
    render(<GradientBackground><div data-testid={testId}>Test Content</div></GradientBackground>);

    await act(async () => { jest.advanceTimersByTime(10); }); // Initial setup

    const contentDiv = screen.getByTestId(testId);
    const contentWrapperDiv = contentDiv.parentElement;
    const bgDivParent = contentWrapperDiv?.parentElement;
    const bg1 = bgDivParent?.children[0];
    const bg2 = bgDivParent?.children[1];

    // Initial state: bg1 visible, bg2 hidden
    expect(bg1).toHaveStyle('opacity: 1');
    expect(bg2).toHaveStyle('opacity: 0');
    const initialBg1Classes = Array.from(bg1?.classList || []);


    // Simulate Math.random for the next gradient selection inside changeGradient
    // changeGradient calls getNewGradientClasses. If bg1 was active, it tries to get a new class for bg2.
    // The mock for Math.random needs to be set for the *next* call inside getNewGradientClasses
    jest.spyOn(Math, 'random').mockReturnValue(1 / mockGradients.length); // Selects mockGradients[1]

    await act(async () => {
      jest.advanceTimersByTime(15000); // GRADIENT_CHANGE_INTERVAL
    });

    // After interval, bg1 should be faded out, bg2 faded in with new classes
    expect(bg1).toHaveStyle('opacity: 0');
    expect(bg2).toHaveStyle('opacity: 1');

    // Check that bg2 has the classes of the second gradient
    expect(bg2).toHaveClass(mockGradients[1].angle);
    mockGradients[1].colors.forEach(colorClass => expect(bg2).toHaveClass(colorClass));

    // Check that bg1 classes are still the original ones
    initialBg1Classes.forEach(cls => expect(bg1).toHaveClass(cls));
  });

  test('uses reduced motion if preferred', async () => {
    matchMediaMock.mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn(),
    }));

    getReducedMotionDurationMock.mockImplementation((duration: number) => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        return mediaQuery.matches ? 0 : duration;
    });

    const testId = "content-div";
    render(<GradientBackground><div data-testid={testId}>Test Content</div></GradientBackground>);
    await act(async () => { jest.advanceTimersByTime(10); });

    const contentDiv = screen.getByTestId(testId);
    const contentWrapperDiv = contentDiv.parentElement;
    const bgDivParent = contentWrapperDiv?.parentElement;

    expect(bgDivParent?.children[0]).toHaveStyle('transition: opacity 0ms ease-in-out');
    expect(bgDivParent?.children[1]).toHaveStyle('transition: opacity 0ms ease-in-out');
  });
});
