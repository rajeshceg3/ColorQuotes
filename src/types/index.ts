// src/types/index.ts
export type QuoteCategory =
  | 'wisdom'
  | 'motivation'
  | 'motivational'
  | 'life'
  | 'philosophy'
  | 'art'
  | 'science'
  | 'success'
  | 'creativity'
  | 'happiness'
  | 'leadership'
  | 'perseverance'
  | 'general';

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
