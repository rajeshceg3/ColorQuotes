// src/services/GradientService.ts
import { GradientDefinition } from '../types';

export class GradientService {
  private static instance: GradientService;
  private gradients: GradientDefinition[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  private async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/gradients');
      if (!response.ok) {
        throw new Error('Failed to fetch gradients');
      }
      const data = await response.json();
      this.gradients = data.gradients;
    } catch (error) {
      console.error("Error initializing GradientService:", error);
      // Re-throw the error to allow the caller to handle it
      throw error;
    }
  }

  public static async getInstance(): Promise<GradientService> {
    if (!GradientService.instance) {
      const instance = new GradientService();
      await instance.initialize();
      GradientService.instance = instance;
    }
    return GradientService.instance;
  }

  public generateGradient(currentGradient: GradientDefinition | null = null): GradientDefinition | null {
    if (this.gradients.length === 0) {
      return null;
    }
    if (this.gradients.length === 1) {
      return this.gradients[0];
    }

    let availableGradients = this.gradients;
    if (currentGradient) {
      availableGradients = this.gradients.filter(
        g => g.angle !== currentGradient.angle || g.colors.join(',') !== currentGradient.colors.join(',')
      );
    }

    // If filtering removed all options (e.g., only one gradient existed and it was the current one),
    // fall back to the full list to ensure a gradient is always returned.
    if (availableGradients.length === 0) {
      availableGradients = this.gradients;
    }

    const randomIndex = Math.floor(Math.random() * availableGradients.length);
    return availableGradients[randomIndex];
  }

  public static formatGradientToTailwind(gradient: GradientDefinition): string {
    if (!gradient) {
      return '';
    }
    return `${gradient.angle} ${gradient.colors.join(' ')}`;
  }
}
