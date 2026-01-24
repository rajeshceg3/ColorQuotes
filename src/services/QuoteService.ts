import { Quote, QuoteCategory } from '../types';
import quotesData from '../data/quotes.json';

interface RawQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  source?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  language?: string;
  character_count?: number;
  tags?: string[];
}

const STORAGE_KEYS = {
  FAVORITES: 'quote-app-favorites',
  VIEWED: 'quote-app-viewed'
};

export class QuoteService {
  private static instance: QuoteService;
  private quotes: Quote[] = [];
  private viewedQuotes: Set<string> = new Set();
  private favoritedQuotes: Set<string> = new Set();
  private isInitialized = false;

  private constructor() {
    this.loadFromStorage();
  }

  public static async getInstance(): Promise<QuoteService> {
    if (!QuoteService.instance) {
      QuoteService.instance = new QuoteService();
    }
    if (!QuoteService.instance.isInitialized) {
        await QuoteService.instance.init();
    }
    return QuoteService.instance;
  }

  private async init(): Promise<void> {
      if (this.isInitialized) return;

      try {
          // Direct import from JSON
          const rawQuotes = quotesData.quotes as RawQuote[];
          this.quotes = rawQuotes.map(q => ({
            id: q.id,
            text: q.text,
            author: q.author,
            category: q.category as QuoteCategory
          }));
      } catch (error) {
          console.error("QuoteService init failed, using fallback", error);
          this.quotes = [
            { id: '1', text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: 'motivation' },
            { id: '2', text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: 'life' },
            { id: '3', text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: 'wisdom' },
          ];
      }
      this.isInitialized = true;
  }

  private loadFromStorage() {
      try {
          const viewed = localStorage.getItem(STORAGE_KEYS.VIEWED);
          if (viewed) this.viewedQuotes = new Set(JSON.parse(viewed));

          const favs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
          if (favs) this.favoritedQuotes = new Set(JSON.parse(favs));
      } catch (e) {
          console.warn('Failed to load storage', e);
      }
  }

  private saveToStorage() {
      try {
          localStorage.setItem(STORAGE_KEYS.VIEWED, JSON.stringify(Array.from(this.viewedQuotes)));
          localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(this.favoritedQuotes)));
      } catch (e) {
          console.warn('Failed to save storage', e);
      }
  }

  public getRandomQuote(): Quote | null {
    const unviewedQuotes = this.quotes.filter(q => !this.viewedQuotes.has(q.id));

    if (unviewedQuotes.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * unviewedQuotes.length);
    const quote = unviewedQuotes[randomIndex];

    this.viewedQuotes.add(quote.id);
    this.saveToStorage();

    return quote;
  }

  public resetViewedQuotes(): void {
    this.viewedQuotes.clear();
    this.saveToStorage();
  }

  public isQuoteFavorited(id: string): boolean {
      return this.favoritedQuotes.has(id);
  }

  public addFavorite(id: string): void {
      this.favoritedQuotes.add(id);
      this.saveToStorage();
  }

  public removeFavorite(id: string): void {
      this.favoritedQuotes.delete(id);
      this.saveToStorage();
  }

  public getQuoteById(id: string): Quote | undefined {
    return this.quotes.find(q => q.id === id);
  }
}
