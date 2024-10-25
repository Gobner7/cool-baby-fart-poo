import { config } from '../../config';
import { EventEmitter } from '../funcaptcha/event-emitter';

interface ProxyConfig {
  url: string;
  headers?: Record<string, string>;
}

export class ProxyManager extends EventEmitter {
  private static instance: ProxyManager;
  private currentProxyIndex: number = 0;
  private lastRotation: number = Date.now();
  private proxyList: ProxyConfig[] = [];
  private proxyScores: Map<string, number> = new Map();

  private constructor() {
    super();
    this.initializeProxyList();
  }

  static getInstance(): ProxyManager {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager();
    }
    return ProxyManager.instance;
  }

  private initializeProxyList() {
    if (config.proxy?.providers) {
      this.proxyList = config.proxy.providers.map(provider => ({
        url: `https://${provider.host}:${provider.port}`,
        headers: provider.auth ? {
          'Proxy-Authorization': `Basic ${btoa(`${provider.auth.username}:${provider.auth.password}`)}`
        } : undefined
      }));

      // Initialize scores
      this.proxyList.forEach(proxy => {
        this.proxyScores.set(proxy.url, 1);
      });
    }
  }

  getCurrentProxy(): ProxyConfig | null {
    if (!this.proxyList.length || !config.proxy?.enabled) {
      return null;
    }
    return this.proxyList[this.currentProxyIndex];
  }

  rotateProxy(): ProxyConfig | null {
    if (!this.proxyList.length) return null;
    
    // Find proxy with highest score
    let bestScore = -1;
    let bestIndex = 0;

    this.proxyList.forEach((proxy, index) => {
      const score = this.proxyScores.get(proxy.url) || 0;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    this.currentProxyIndex = bestIndex;
    this.lastRotation = Date.now();
    
    const proxy = this.getCurrentProxy();
    this.emit('proxyRotated', proxy);
    
    return proxy;
  }

  updateProxyScore(url: string, success: boolean) {
    const currentScore = this.proxyScores.get(url) || 1;
    const newScore = success
      ? Math.min(currentScore * 1.1, 10)
      : Math.max(currentScore * 0.8, 0.1);
    this.proxyScores.set(url, newScore);
  }

  addProxy(proxy: ProxyConfig): void {
    this.proxyList.push(proxy);
    this.proxyScores.set(proxy.url, 1);
    this.emit('proxyAdded', proxy);
  }

  removeProxy(url: string): void {
    const index = this.proxyList.findIndex(p => p.url === url);
    if (index !== -1) {
      const proxy = this.proxyList[index];
      this.proxyList.splice(index, 1);
      this.proxyScores.delete(url);
      if (this.currentProxyIndex >= this.proxyList.length) {
        this.currentProxyIndex = 0;
      }
      this.emit('proxyRemoved', proxy);
    }
  }

  getProxyList(): ProxyConfig[] {
    return [...this.proxyList];
  }

  getProxyScores(): Map<string, number> {
    return new Map(this.proxyScores);
  }

  clearProxies(): void {
    this.proxyList = [];
    this.proxyScores.clear();
    this.currentProxyIndex = 0;
    this.emit('proxiesCleared');
  }

  getProxyCount(): number {
    return this.proxyList.length;
  }

  isProxyEnabled(): boolean {
    return Boolean(config.proxy?.enabled);
  }
}

export const proxyManager = ProxyManager.getInstance();