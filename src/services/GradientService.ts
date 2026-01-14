import { GradientDefinition } from '../types';

interface ApiGradient {
    type: string;
    angle: string;
    colors: string[];
}

export class GradientService {
  private static instance: GradientService;
  private gradients: GradientDefinition[] = [];
  private isInitialized = false;

  private constructor() {
    this.setFallbacks();
  }

  private setFallbacks() {
      // Fallback "Rich" gradients
      this.gradients = [
        { colors: ['from-[#007aff]', 'via-[#5ac8fa]', 'to-[#5856d6]'], direction: 'bg-gradient-to-br' }, // Deep Blue/Purple
        { colors: ['from-[#ff2d55]', 'via-[#ff9500]', 'to-[#ffcc00]'], direction: 'bg-gradient-to-tr' }, // Sunset
        { colors: ['from-[#af52de]', 'via-[#ff2d55]', 'to-[#ffcc00]'], direction: 'bg-gradient-to-bl' }, // Cosmic
        { colors: ['from-[#34c759]', 'via-[#007aff]', 'to-[#5856d6]'], direction: 'bg-gradient-to-tl' }, // Aurora
      ];
  }

  public static async getInstance(): Promise<GradientService> {
    if (!GradientService.instance) {
      GradientService.instance = new GradientService();
    }
    if (!GradientService.instance.isInitialized) {
        await GradientService.instance.init();
    }
    return GradientService.instance;
  }

  private async init(): Promise<void> {
      if (this.isInitialized) return;

      try {
          const response = await fetch('/api/gradients');
          if (!response.ok) throw new Error('Failed to fetch gradients');
          const data = await response.json();

          if (data.gradients && Array.isArray(data.gradients)) {
             this.gradients = data.gradients.map((g: ApiGradient) => ({
                 direction: g.angle,
                 colors: g.colors
             }));
          }
      } catch (error) {
          console.error("GradientService init failed, using fallbacks", error);
          this.setFallbacks();
      }
      this.isInitialized = true;
  }

  public generateGradient(exclude?: GradientDefinition | null): GradientDefinition {
    let availableGradients = this.gradients;

    // Ensure we have gradients
    if (availableGradients.length === 0) {
        this.setFallbacks();
        availableGradients = this.gradients;
    }

    if (exclude) {
        // Simple exclusion based on the first color
        const filtered = this.gradients.filter(g =>
            g.colors[0] !== exclude.colors[0]
        );
        if (filtered.length > 0) {
            availableGradients = filtered;
        }
    }

    const randomIndex = Math.floor(Math.random() * availableGradients.length);
    return availableGradients[randomIndex];
  }

  public static formatGradientToTailwind(gradient: GradientDefinition): string {
    return `${gradient.direction} ${gradient.colors.join(' ')}`;
  }
}

export type { GradientDefinition };
