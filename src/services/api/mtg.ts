import axios from 'axios';

interface MTGGraphQLConfig {
  endpoint: string;
  apiKey: string;
}

class MTGService {
  private static instance: MTGService;
  private config: MTGGraphQLConfig = {
    endpoint: 'https://api.mtgql.com/v1/graphql',
    apiKey: ''
  };

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): MTGService {
    if (!MTGService.instance) {
      MTGService.instance = new MTGService();
    }
    return MTGService.instance;
  }

  private loadConfig() {
    const apiKey = localStorage.getItem('mtg_graphql_key');
    if (apiKey) {
      this.config.apiKey = apiKey;
    }
  }

  async searchCards(query: string) {
    if (!this.config.apiKey) {
      throw new Error('MTG GraphQL API key not configured');
    }

    const graphqlQuery = `
      query SearchCards($name: String!) {
        cards(filter: { name_eq: $name }) {
          name
          setCode
          type
          text
          prices {
            provider
            date
            cardType
            listType
            price
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.config.endpoint,
        {
          query: graphqlQuery,
          variables: { name: query }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.data.cards;
    } catch (error) {
      console.error('MTG API error:', error);
      throw error;
    }
  }

  async getCardPriceHistory(cardName: string) {
    if (!this.config.apiKey) {
      throw new Error('MTG GraphQL API key not configured');
    }

    const graphqlQuery = `
      query CardPriceHistory($name: String!) {
        cards(filter: { name_eq: $name }) {
          name
          prices {
            provider
            date
            price
            cardType
            listType
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.config.endpoint,
        {
          query: graphqlQuery,
          variables: { name: cardName }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.data.cards[0]?.prices || [];
    } catch (error) {
      console.error('MTG API error:', error);
      throw error;
    }
  }

  async getSetData(setCode: string) {
    if (!this.config.apiKey) {
      throw new Error('MTG GraphQL API key not configured');
    }

    const graphqlQuery = `
      query SetData($code: String!) {
        sets(filter: { code_eq: $code }) {
          code
          name
          releaseDate
          totalSetSize
          cards {
            name
            number
            rarity
            prices {
              provider
              price
              date
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.config.endpoint,
        {
          query: graphqlQuery,
          variables: { code: setCode }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.data.sets[0];
    } catch (error) {
      console.error('MTG API error:', error);
      throw error;
    }
  }
}

export const mtgService = MTGService.getInstance();