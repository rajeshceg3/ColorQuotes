// src/services/QuoteService.ts
import { Quote, QuoteCategory } from '../types';
import allQuotesData from '../data/quotes.json'; // Adjusted path
import { LocalStorageService } from './LocalStorageService';

const VIEWED_QUOTES_KEY = 'viewedQuotes';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface ViewedQuotes {
  [id: string]: string; // Store quote ID and ISO timestamp of when it was viewed
}

const FAVORITED_QUOTES_KEY = 'favoriteQuoteIds';

export class QuoteService {
  private static instance: QuoteService;
  private quotes: Quote[];

  private constructor() {
    // Ensure character_count is a number, and dates are strings
    this.quotes = allQuotesData.quotes.map(q => ({
      ...q,
      character_count: Number(q.character_count),
      // Ensure category is of QuoteCategory type (runtime check might be needed if data is unreliable)
      category: q.category as QuoteCategory,
      created_at: String(q.created_at),
      updated_at: String(q.updated_at),
    }));
  }

  public static getInstance(): QuoteService {
    if (!QuoteService.instance) {
      QuoteService.instance = new QuoteService();
    }
    return QuoteService.instance;
  }

  public getRandomQuote(currentCategory?: QuoteCategory): Quote | null {
    const viewedQuotes = LocalStorageService.getItem<ViewedQuotes>(VIEWED_QUOTES_KEY) || {};
    const now = new Date().getTime();

    // Filter out recently viewed quotes
    const availableQuotes = this.quotes.filter(quote => {
      const viewedTimestamp = viewedQuotes[quote.id];
      if (viewedTimestamp) {
        const viewedDate = new Date(viewedTimestamp).getTime();
        if (now - viewedDate < TWENTY_FOUR_HOURS_MS) {
          return false; // Recently viewed
        }
      }
      return true;
    });

    let categoryFilteredQuotes = currentCategory
      ? availableQuotes.filter(quote => quote.category === currentCategory)
      : availableQuotes;

    if (categoryFilteredQuotes.length === 0) {
      // If no quotes are available after filtering, reset the viewed quotes for the given category
      if (currentCategory) {
        const viewedQuotes = LocalStorageService.getItem<ViewedQuotes>(VIEWED_QUOTES_KEY) || {};
        this.quotes.forEach(quote => {
          if (quote.category === currentCategory) {
            delete viewedQuotes[quote.id];
          }
        });
        LocalStorageService.setItem(VIEWED_QUOTES_KEY, viewedQuotes);
        
        // After resetting, get all quotes of the category
        categoryFilteredQuotes = this.quotes.filter(quote => quote.category === currentCategory);
      } else {
        // If no category is specified and all quotes are viewed, reset all viewed quotes
        LocalStorageService.removeItem(VIEWED_QUOTES_KEY);
        categoryFilteredQuotes = this.quotes;
      }
    }

    if (categoryFilteredQuotes.length === 0) {
      return null; // No quotes available at all
    }

    const randomIndex = Math.floor(Math.random() * categoryFilteredQuotes.length);
    const selectedQuote = categoryFilteredQuotes[randomIndex];

    if (selectedQuote) {
      // Record viewed quote
      viewedQuotes[selectedQuote.id] = new Date().toISOString();
      // Clean up old entries (older than 24 hours - though they are filtered anyway)
      // More aggressive cleanup might remove entries older than, say, 7 days
      for (const quoteId in viewedQuotes) {
        if (now - new Date(viewedQuotes[quoteId]).getTime() > TWENTY_FOUR_HOURS_MS * 7) { // Clean up after 7 days
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
