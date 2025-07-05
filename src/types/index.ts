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
  created_at?: Date; // Optional for now
  updated_at?: Date; // Optional for now
  language?: string; // Optional for now
  character_count: number;
  tags: string[];
}
