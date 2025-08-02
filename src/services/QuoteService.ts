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
      this.quotes = []; // Fallback to empty quotes on error
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
    let viewedQuotes = LocalStorageService.getItem<ViewedQuotes>(VIEWED_QUOTES_KEY) || {};
    const now = new Date().getTime();

    // 1. Filter all quotes by "not recently viewed"
    const availableQuotesGlobal = this.quotes.filter(quote => {
      const viewedTimestamp = viewedQuotes[quote.id];
      if (viewedTimestamp) {
        return now - new Date(viewedTimestamp).getTime() >= TWENTY_FOUR_HOURS_MS;
      }
      return true;
    });

    let quotesToConsider: Quote[];

    if (currentCategory) {
      // 2. If a currentCategory is provided, further filter availableQuotesGlobal
      const categoryAvailableQuotes = availableQuotesGlobal.filter(
        quote => quote.category === currentCategory
      );

      if (categoryAvailableQuotes.length > 0) {
        quotesToConsider = categoryAvailableQuotes;
      } else {
        // If no quotes in the category are available, reset viewed for that category and retry
        const categoryQuotes = this.quotes.filter(q => q.category === currentCategory);

        // Reset viewed quotes for this category by removing them from the viewedQuotes object
        categoryQuotes.forEach(q => {
          delete viewedQuotes[q.id];
        });

        // Persist the changes to viewedQuotes (optional, but good for consistency)
        LocalStorageService.setItem(VIEWED_QUOTES_KEY, viewedQuotes);

        // Now, all quotes in the category are available again
        quotesToConsider = categoryQuotes;
      }
    } else {
      // No currentCategory provided
      if (availableQuotesGlobal.length > 0) {
        quotesToConsider = availableQuotesGlobal;
      } else {
        // 5. All quotes globally viewed, and no category specified. Reset all.
        LocalStorageService.removeItem(VIEWED_QUOTES_KEY);
        viewedQuotes = {}; // Reset local copy
        quotesToConsider = this.quotes; // Consider all quotes after reset
      }
    }

    if (quotesToConsider.length === 0) {
      // This should ideally not happen, but as a fallback, use all quotes.
      quotesToConsider = this.quotes;
    }

    const randomIndex = Math.floor(Math.random() * quotesToConsider.length);
    const selectedQuote = quotesToConsider[randomIndex];

    if (selectedQuote) {
      // Record viewed quote
      viewedQuotes[selectedQuote.id] = new Date().toISOString();
      // Clean up old entries (older than 7 days)
      // This cleanup is less critical now with the stricter availability logic, but good for hygiene
      for (const quoteId in viewedQuotes) {
        if (now - new Date(viewedQuotes[quoteId]).getTime() > TWENTY_FOUR_HOURS_MS * 7) {
          delete viewedQuotes[quoteId];
        }
      }
      LocalStorageService.setItem(VIEWED_QUOTES_KEY, viewedQuotes);
    }

    return selectedQuote;
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
