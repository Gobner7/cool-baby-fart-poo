import { config } from '../../config';

class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequestTime = 0;
  private requestCount = 0;

  constructor(
    private maxRequests: number,
    private interval: number
  ) {}

  async throttle(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const now = Date.now();

    if (now - this.lastRequestTime >= this.interval) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    while (this.queue.length > 0 && this.requestCount < this.maxRequests) {
      const resolve = this.queue.shift();
      if (resolve) {
        this.requestCount++;
        resolve();
      }
    }

    if (this.queue.length > 0) {
      const delay = this.interval - (now - this.lastRequestTime);
      setTimeout(() => {
        this.processing = false;
        this.processQueue();
      }, Math.max(0, delay));
    } else {
      this.processing = false;
    }
  }
}

export const rateLimiters = {
  steam: new RateLimiter(
    config.markets.steam.rateLimit.requests,
    config.markets.steam.rateLimit.interval
  ),
  buff: new RateLimiter(
    config.markets.buff.rateLimit.requests,
    config.markets.buff.rateLimit.interval
  ),
  skinport: new RateLimiter(
    config.markets.skinport.rateLimit.requests,
    config.markets.skinport.rateLimit.interval
  )
};