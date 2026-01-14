// src/types/index.ts
export type QuoteCategory = 'wisdom' | 'motivation' | 'life' | 'philosophy' | 'art' | 'science';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
}

export interface GradientDefinition {
  colors: string[];
  direction: string;
}
