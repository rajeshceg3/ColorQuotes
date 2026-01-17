/* eslint-disable @typescript-eslint/no-explicit-any */
// src/__mocks__/services/GradientService.ts

const mockGenerateGradient = jest.fn();
const mockFormatGradientToTailwind = jest.fn();

const mockServiceInstance = {
  generateGradient: mockGenerateGradient,
};

const mockGetInstance = jest.fn().mockResolvedValue(mockServiceInstance);

const GradientService = jest.fn().mockImplementation(() => {
  return mockServiceInstance;
});

(GradientService as any).getInstance = mockGetInstance;
(GradientService as any).formatGradientToTailwind = mockFormatGradientToTailwind;

export { GradientService };

export const __GradientServiceMocks = {
  mockGetInstance,
  mockGenerateGradient,
  mockFormatGradientToTailwind,
};
