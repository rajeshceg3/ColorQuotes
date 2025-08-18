// src/services/QuoteService.ts
import { Quote, QuoteCategory } from '../types';
import { LocalStorageService } from './LocalStorageService';

const VIEWED_QUOTES_KEY = 'viewedQuotes';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface ViewedQuotes {
  [id: string]: string; // Store quote ID and ISO timestamp of when it was viewed
}

const FAVORITED_QUOTES_KEY = 'favoriteQuoteIds';

export class QuoteService {
  private static instance: QuoteService;
  private quotes: Quote[] = [];

  private constructor() {
    // Constructor is now empty, initialization is handled asynchronously.
  }

  private async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/quotes');
      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.statusText}`);
      }
      const allQuotesData = await response.json();

      // Ensure character_count is a number, and dates are strings
      this.quotes = allQuotesData.quotes.map((q: any) => ({
        ...q,
        character_count: Number(q.character_count),
        category: q.category as QuoteCategory,
        created_at: String(q.created_at),
        updated_at: String(q.updated_at),
      }));
    } catch (error) {
      console.error('Error initializing QuoteService:', error);
      // Re-throw the error to allow the caller to handle it
      throw error;
    }
  }

  public static async getInstance(): Promise<QuoteService> {
    if (!QuoteService.instance) {
      const instance = new QuoteService();
      await instance.initialize();
      QuoteService.instance = instance;
    }
    return QuoteService.instance;
  }

  public getRandomQuote(currentCategory?: QuoteCategory): Quote | null {
    if (this.quotes.length === 0) {
      return null;
    }

    const viewedQuotes = LocalStorageService.getItem<ViewedQuotes>(VIEWED_QUOTES_KEY) || {};
    const now = new Date().getTime();

    const sourceQuotes = currentCategory
      ? this.quotes.filter(q => q.category === currentCategory)
      : this.quotes;

    const availableQuotes = sourceQuotes.filter(quote => {
      const viewedTimestamp = viewedQuotes[quote.id];
      if (!viewedTimestamp) return true;
      return now - new Date(viewedTimestamp).getTime() >= TWENTY_FOUR_HOURS_MS;
    });

    if (availableQuotes.length === 0 && sourceQuotes.length > 0) {
      return null; // Signal that we're out of quotes for this cycle
    }

    if (availableQuotes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    const selectedQuote = availableQuotes[randomIndex];

    // Record viewed quote
    viewedQuotes[selectedQuote.id] = new Date().toISOString();
    LocalStorageService.setItem(VIEWED_QUOTES_KEY, viewedQuotes);

    return selectedQuote;
  }

  public resetViewedQuotes(category?: QuoteCategory): void {
    if (!category) {
      LocalStorageService.removeItem(VIEWED_QUOTES_KEY);
    } else {
      const viewedQuotes = LocalStorageService.getItem<ViewedQuotes>(VIEWED_QUOTES_KEY) || {};
      const categoryQuoteIds = new Set(
        this.quotes.filter(q => q.category === category).map(q => q.id)
      );

      for (const quoteId in viewedQuotes) {
        if (categoryQuoteIds.has(quoteId)) {
          delete viewedQuotes[quoteId];
        }
      }
      LocalStorageService.setItem(VIEWED_QUOTES_KEY, viewedQuotes);
    }
  }

  public getQuoteById(id: string): Quote | null {
    return this.quotes.find(quote => quote.id === id) || null;
  }

  public getQuotes(count: number, category?: QuoteCategory): Quote[] {
    const filteredQuotes = category
      ? this.quotes.filter(quote => quote.category === category)
      : this.quotes;

    return filteredQuotes.slice(0, count);
  }

  public getAllCategories(): QuoteCategory[] {
    const categories = new Set<QuoteCategory>();
    this.quotes.forEach(quote => categories.add(quote.category));
    return Array.from(categories);
  }

  // Favorite Management Methods
  public getFavoriteQuoteIds(): string[] {
    return LocalStorageService.getItem<string[]>(FAVORITED_QUOTES_KEY) || [];
  }

  public isQuoteFavorited(quoteId: string): boolean {
    const favorites = this.getFavoriteQuoteIds();
    return favorites.includes(quoteId);
  }

  public addFavorite(quoteId: string): void {
    const favorites = this.getFavoriteQuoteIds();
    if (!favorites.includes(quoteId)) {
      favorites.push(quoteId);
      LocalStorageService.setItem(FAVORITED_QUOTES_KEY, favorites);
    }
  }

  public removeFavorite(quoteId: string): void {
    let favorites = this.getFavoriteQuoteIds();
    if (favorites.includes(quoteId)) {
      favorites = favorites.filter(id => id !== quoteId);
      LocalStorageService.setItem(FAVORITED_QUOTES_KEY, favorites);
    }
  }
}
