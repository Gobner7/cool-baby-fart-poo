import axios from 'axios';
import * as cheerio from 'cheerio';
import { CardListing, CardData } from '../../types/market';
import { proxyRotator } from '../proxy';
import { rateLimiter } from '../rate-limiter';

class MarketScraper {
  private static instance: MarketScraper;
  private readonly EBAY_BASE_URL = 'https://www.ebay.com';
  private readonly TCG_BASE_URL = 'https://www.tcgplayer.com';
  private readonly CARDMARKET_BASE_URL = 'https://www.cardmarket.com';
  private readonly HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  private constructor() {}

  static getInstance(): MarketScraper {
    if (!MarketScraper.instance) {
      MarketScraper.instance = new MarketScraper();
    }
    return MarketScraper.instance;
  }

  async searchEbay(query: string, category?: string): Promise<CardListing[]> {
    await rateLimiter.throttle('ebay');
    const proxy = await proxyRotator.getProxy();

    try {
      const url = new URL('/sch/i.html', this.EBAY_BASE_URL);
      url.searchParams.append('_nkw', query);
      if (category) url.searchParams.append('_sacat', category);

      const response = await axios.get(url.toString(), {
        headers: this.HEADERS,
        proxy: proxy ? {
          host: proxy.host,
          port: proxy.port,
          auth: proxy.auth
        } : undefined
      });

      const $ = cheerio.load(response.data);
      const listings: CardListing[] = [];

      $('.s-item__wrapper').each((_, element) => {
        const title = $(element).find('.s-item__title').text();
        const priceText = $(element).find('.s-item__price').text();
        const price = this.extractPrice(priceText);
        const shippingText = $(element).find('.s-item__shipping').text();
        const shipping = this.extractPrice(shippingText) || 0;
        const imageUrl = $(element).find('.s-item__image-img').attr('src') || '';
        const url = $(element).find('.s-item__link').attr('href') || '';
        const bidsText = $(element).find('.s-item__bids').text();
        const bids = bidsText ? parseInt(bidsText) : undefined;
        const isAuction = !!bidsText;

        if (title && price) {
          listings.push({
            id: url.split('itm/')[1]?.split('?')[0] || crypto.randomUUID(),
            title,
            price,
            shipping,
            condition: $(element).find('.s-item__condition').text(),
            seller: {
              id: '',
              name: $(element).find('.s-item__seller-info-text').text(),
              rating: 0,
              totalSales: 0
            },
            platform: 'ebay',
            imageUrl,
            url,
            isAuction,
            bids,
            lastUpdated: new Date()
          });
        }
      });

      return listings;
    } catch (error) {
      console.error('eBay scraping error:', error);
      throw error;
    }
  }

  async getCompletedSales(cardName: string, days: number = 30): Promise<CardListing[]> {
    await rateLimiter.throttle('ebay');
    const proxy = await proxyRotator.getProxy();

    try {
      const url = new URL('/sch/i.html', this.EBAY_BASE_URL);
      url.searchParams.append('_nkw', cardName);
      url.searchParams.append('LH_Complete', '1');
      url.searchParams.append('LH_Sold', '1');

      const response = await axios.get(url.toString(), {
        headers: this.HEADERS,
        proxy: proxy ? {
          host: proxy.host,
          port: proxy.port,
          auth: proxy.auth
        } : undefined
      });

      const $ = cheerio.load(response.data);
      const completedSales: CardListing[] = [];

      $('.s-item__wrapper').each((_, element) => {
        const soldDate = new Date($(element).find('.s-item__ended-date').text());
        if (soldDate && (Date.now() - soldDate.getTime()) <= days * 24 * 60 * 60 * 1000) {
          const title = $(element).find('.s-item__title').text();
          const priceText = $(element).find('.s-item__price').text();
          const price = this.extractPrice(priceText);

          if (title && price) {
            completedSales.push({
              id: crypto.randomUUID(),
              title,
              price,
              shipping: 0,
              condition: $(element).find('.s-item__condition').text(),
              seller: {
                id: '',
                name: '',
                rating: 0,
                totalSales: 0
              },
              platform: 'ebay',
              imageUrl: $(element).find('.s-item__image-img').attr('src') || '',
              url: $(element).find('.s-item__link').attr('href') || '',
              endTime: soldDate,
              isAuction: false,
              lastUpdated: new Date()
            });
          }
        }
      });

      return completedSales;
    } catch (error) {
      console.error('Completed sales scraping error:', error);
      throw error;
    }
  }

  private extractPrice(text: string): number {
    const match = text.match(/\$\s*([\d,]+\.?\d*)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return 0;
  }

  async getCardDetails(cardName: string, type: CardData['type']): Promise<Partial<CardData>> {
    switch (type) {
      case 'pokemon':
        return this.getPokemonCardDetails(cardName);
      case 'mtg':
        return this.getMTGCardDetails(cardName);
      case 'yugioh':
        return this.getYuGiOhCardDetails(cardName);
      case 'sports':
        return this.getSportsCardDetails(cardName);
      default:
        throw new Error(`Unsupported card type: ${type}`);
    }
  }

  private async getPokemonCardDetails(cardName: string): Promise<Partial<CardData>> {
    // Implementation for Pokemon TCG API
    return {};
  }

  private async getMTGCardDetails(cardName: string): Promise<Partial<CardData>> {
    // Implementation for MTG API
    return {};
  }

  private async getYuGiOhCardDetails(cardName: string): Promise<Partial<CardData>> {
    // Implementation for Yu-Gi-Oh! API
    return {};
  }

  private async getSportsCardDetails(cardName: string): Promise<Partial<CardData>> {
    // Implementation for Sports Cards API
    return {};
  }
}

export const marketScraper = MarketScraper.getInstance();