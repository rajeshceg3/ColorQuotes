// src/services/GradientService.ts
import allGradientsData from '../data/gradients.json'; // Adjusted path

export interface GradientDefinition {
  type: string;
  angle: string;
  colors: string[];
}

export class GradientService {
  private static instance: GradientService;
  private gradients: GradientDefinition[];

  private constructor() {
    this.gradients = allGradientsData.gradients;
  }

  public static getInstance(): GradientService {
    if (!GradientService.instance) {
      GradientService.instance = new GradientService();
    }
    return GradientService.instance;
  }

  /**
   * Generates a random gradient definition.
   * @param currentGradient Optional. If provided, the new gradient will be different from this one, if possible.
   * @returns A gradient definition object.
   */
  public generateGradient(currentGradient?: GradientDefinition): GradientDefinition | null {
    if (!this.gradients || this.gradients.length === 0) {
      return null; // No gradients available
    }

    if (this.gradients.length === 1) {
      return this.gradients[0];
    }

    let selectedGradient: GradientDefinition;
    let attempts = 0;
    const maxAttempts = this.gradients.length * 2; // Set a reasonable attempt limit

    do {
      const randomIndex = Math.floor(Math.random() * this.gradients.length);
      selectedGradient = this.gradients[randomIndex];
      attempts++;
    } while (
      currentGradient &&
      selectedGradient.angle === currentGradient.angle &&
      selectedGradient.colors.join(',') === currentGradient.colors.join(',') &&
      attempts < maxAttempts
    );

    return selectedGradient;
  }

  /**
   * Formats a gradient definition object into Tailwind CSS classes.
   * @param gradient The gradient definition object.
   * @returns A string of Tailwind CSS classes.
   */
  public static formatGradientToTailwind(gradient: GradientDefinition): string {
    if (!gradient) return '';
    // Example: "bg-gradient-to-r from-pastel-pink-1 via-pastel-purple-1 to-pastel-blue-1"
    // The 'colors' array already contains "from-...", "via-...", "to-..." prefixes.
    return `${gradient.angle} ${gradient.colors.join(' ')}`;
  }
}
