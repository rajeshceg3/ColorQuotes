import { GradientService, GradientDefinition } from './GradientService';

jest.mock('../data/gradients.json', () => ({
  gradients: [
    { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-red-500', 'to-blue-500'] },
    { type: 'linear', angle: 'bg-gradient-to-b', colors: ['from-green-500', 'to-yellow-500'] },
  ],
}));

jest.mock('../../data/gradients.json', () => ({
  gradients: [
    { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-red-500', 'to-blue-500'] },
    { type: 'linear', angle: 'bg-gradient-to-b', colors: ['from-green-500', 'to-yellow-500'] },
    { type: 'linear', angle: 'bg-gradient-to-l', colors: ['from-purple-500', 'to-pink-500'] },
  ]
}));

describe('GradientService', () => {
  let gradientService: GradientService;
  const mockGradients: GradientDefinition[] = [
    { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-red-500', 'to-blue-500'] },
    { type: 'linear', angle: 'bg-gradient-to-b', colors: ['from-green-500', 'to-yellow-500'] },
    { type: 'linear', angle: 'bg-gradient-to-l', colors: ['from-purple-500', 'to-pink-500'] },
  ];

  beforeEach(async () => {
    const module = await import('./GradientService');
    gradientService = module.GradientService.getInstance();
  });

  afterEach(() => {
    jest.resetModules();
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
      const singleGradientMockItem = { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-orange-500', 'to-teal-500'] };

      // Modify the internal state of the 'gradientService' instance from beforeEach.
      // This instance is configured by default with mockGradients.
      (gradientService as unknown as { gradients: GradientDefinition[] }).gradients = [singleGradientMockItem];

      // Call the original method on the modified instance,
      // providing the single existing gradient as the current one.
      const result = gradientService.generateGradient(singleGradientMockItem);
      expect(result).toEqual(singleGradientMockItem);
    });

    it('should return null if no gradients are available', () => {
        const serviceWithNoGradients = GradientService.getInstance();
        (serviceWithNoGradients as unknown as { gradients: GradientDefinition[] }).gradients = []; // Set to empty
        const gradient = serviceWithNoGradients.generateGradient();
        expect(gradient).toBeNull();
    });

    it('should return the gradient if only one is available, regardless of currentGradient', () => {
        // Using the 'gradientService' instance from beforeEach for consistency.
        const singleGradient = { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-single-1', 'to-single-2'] };
        (gradientService as unknown as { gradients: GradientDefinition[] }).gradients = [singleGradient]; // Modify the instance from beforeEach

        const currentOther = { type: 'linear', angle: 'bg-gradient-to-b', colors: ['from-other-1', 'to-other-2'] };
        let gradient = gradientService.generateGradient(currentOther);
        expect(gradient).toEqual(singleGradient);

        // Case where currentGradient is the only one available
        gradient = gradientService.generateGradient(singleGradient);
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
      expect(GradientService.formatGradientToTailwind(null as unknown as GradientDefinition)).toBe('');
      expect(GradientService.formatGradientToTailwind(undefined as unknown as GradientDefinition)).toBe('');
    });
  });
});
