export enum QuoteCategory {
  MOTIVATIONAL = 'motivational',
  SUCCESS = 'success',
  HAPPINESS = 'happiness',
  WISDOM = 'wisdom',
  CREATIVITY = 'creativity',
  LEADERSHIP = 'leadership',
  PERSEVERANCE = 'perseverance',
  GENERAL = 'general',
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
  source?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
  language: string;
  character_count: number;
  tags: string[];
}

export interface GradientDefinition {
  angle: string;
  colors: string[];
}
