// src/services/GradientService.test.ts
import { GradientService, GradientDefinition } from './GradientService';

const mockGradients: GradientDefinition[] = [
  { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-red-500', 'to-blue-500'] },
  { type: 'linear', angle: 'bg-gradient-to-b', colors: ['from-green-500', 'to-yellow-500'] },
  { type: 'linear', angle: 'bg-gradient-to-l', colors: ['from-purple-500', 'to-pink-500'] },
];

// Mock the data module
jest.mock('../../data/gradients.json', () => ({
  gradients: mockGradients,
}), { virtual: true });

describe('GradientService', () => {
  let gradientService: GradientService;

  beforeEach(() => {
    // Get a fresh instance for each test.
    // Similar to QuoteService, relies on jest.resetModules() if state becomes an issue,
    // or a dedicated reset method on the service.
    gradientService = GradientService.getInstance();
     // Jest's hoisting of `jest.mock` should ensure mockGradients are used by the constructor.
  });

  describe('generateGradient', () => {
    it('should return a random gradient from the list', () => {
      const gradient = gradientService.generateGradient();
      expect(gradient).not.toBeNull();
      // Check if the returned gradient is one of the mock gradients
      expect(mockGradients).toContainEqual(gradient!);
    });

    it('should return a different gradient if currentGradient is provided and multiple gradients exist', () => {
      const currentGradient = mockGradients[0];
      // Run multiple times to increase confidence
      for (let i = 0; i < 10; i++) {
        const newGradient = gradientService.generateGradient(currentGradient);
        expect(newGradient).not.toBeNull();
        // Check that it's not the same as currentGradient (object reference or deep equality)
        // Simple comparison based on properties used in the service's logic
        const isSame = newGradient!.angle === currentGradient.angle &&
                       newGradient!.colors.join(',') === currentGradient.colors.join(',');
        if (mockGradients.length > 1) {
          expect(isSame).toBe(false);
        } else {
          expect(isSame).toBe(true); // Must be same if only one gradient
        }
      }
    });

    it('should return the same gradient if only one gradient exists, even if provided as current', () => {
      // Temporarily mock gradients to have only one
      const singleGradientMock = [{ type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-orange-500', 'to-teal-500'] }];
      jest.spyOn(gradientService, 'generateGradient').mockImplementationOnce(() => {
        // This mocking strategy is a bit tricky because the service reads data in constructor.
        // A better way would be to mock the gradients.json import for this specific test,
        // or make the service's gradient list mutable for testing.
        // For now, let's test the logic directly: if the list had one item.
        // This test will be conceptual or require a more complex setup.
        // Alternative: modify the instance's private `gradients` for this test if possible.
        const serviceWithOneGradient = GradientService.getInstance(); // new instance
        (serviceWithOneGradient as any).gradients = singleGradientMock; // Type assertion to access private

        const current = singleGradientMock[0];
        const result = serviceWithOneGradient.generateGradient(current);
        expect(result).toEqual(current);
        return result; // Added return
      });
      gradientService.generateGradient(); // Call the mocked method
    });

    it('should return null if no gradients are available', () => {
        const serviceWithNoGradients = GradientService.getInstance();
        (serviceWithNoGradients as any).gradients = []; // Set to empty
        const gradient = serviceWithNoGradients.generateGradient();
        expect(gradient).toBeNull();
    });

    it('should return the gradient if only one is available, regardless of currentGradient', () => {
        const serviceWithOneGradient = GradientService.getInstance();
        const singleGradient = { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-single-1', 'to-single-2'] };
        (serviceWithOneGradient as any).gradients = [singleGradient];

        const current = { type: 'linear', angle: 'bg-gradient-to-b', colors: ['from-other-1', 'to-other-2'] };
        let gradient = serviceWithOneGradient.generateGradient(current);
        expect(gradient).toEqual(singleGradient);

        gradient = serviceWithOneGradient.generateGradient(singleGradient); // Current is the only one
        expect(gradient).toEqual(singleGradient);
    });
  });

  describe('formatGradientToTailwind', () => {
    it('should correctly format a gradient definition into Tailwind classes', () => {
      const gradientDef: GradientDefinition = {
        type: 'linear',
        angle: 'bg-gradient-to-r',
        colors: ['from-red-500', 'via-green-500', 'to-blue-500'],
      };
      const expectedClasses = 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500';
      expect(GradientService.formatGradientToTailwind(gradientDef)).toBe(expectedClasses);
    });

    it('should handle gradients with two colors', () => {
      const gradientDef: GradientDefinition = {
        type: 'linear',
        angle: 'bg-gradient-to-b',
        colors: ['from-yellow-300', 'to-orange-600'],
      };
      const expectedClasses = 'bg-gradient-to-b from-yellow-300 to-orange-600';
      expect(GradientService.formatGradientToTailwind(gradientDef)).toBe(expectedClasses);
    });

    it('should return an empty string if gradient is null or undefined', () => {
      expect(GradientService.formatGradientToTailwind(null as any)).toBe('');
      expect(GradientService.formatGradientToTailwind(undefined as any)).toBe('');
    });
  });
});
