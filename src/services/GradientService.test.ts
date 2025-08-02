// src/services/GradientService.test.ts
jest.unmock('./GradientService');

import { GradientService } from './GradientService';

const mockGradientsData = {
  gradients: [
    { type: 'linear', angle: 'bg-gradient-to-r', colors: ['from-red-500', 'to-blue-500'] },
    { type: 'linear', angle: 'bg-gradient-to-b', colors: ['from-green-500', 'to-yellow-500'] },
  ],
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockGradientsData),
  })
) as jest.Mock;

describe('GradientService (Real Implementation)', () => {
  let gradientService: GradientService;

  beforeEach(async () => {
    (GradientService as any).instance = null;
    (global.fetch as jest.Mock).mockClear();
    gradientService = await GradientService.getInstance();
  });

  it('should fetch and process gradients during initialization', async () => {
    expect(global.fetch).toHaveBeenCalledWith('/api/gradients');
    // Test that the service has processed the gradients
    const gradient = gradientService.generateGradient();
    expect(gradient).toBeDefined();
  });

  it('should return a different gradient when one is provided', () => {
    const current = mockGradientsData.gradients[0];
    const newGradient = gradientService.generateGradient(current);
    expect(newGradient).not.toEqual(current);
  });

  it('should format gradient to tailwind classes', () => {
    const gradient = mockGradientsData.gradients[0];
    const expected = 'bg-gradient-to-r from-red-500 to-blue-500';
    expect(GradientService.formatGradientToTailwind(gradient)).toBe(expected);
  });
});
