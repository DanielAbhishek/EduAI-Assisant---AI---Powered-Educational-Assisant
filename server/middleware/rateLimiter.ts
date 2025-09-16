import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class SimpleRateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = this.getIdentifier(req);
      const now = Date.now();
      
      if (!this.store[identifier] || this.store[identifier].resetTime < now) {
        this.store[identifier] = {
          count: 1,
          resetTime: now + this.windowMs
        };
        return next();
      }

      this.store[identifier].count++;

      if (this.store[identifier].count > this.maxRequests) {
        res.status(429).json({
          message: "Too many requests, please try again later.",
          retryAfter: Math.ceil((this.store[identifier].resetTime - now) / 1000)
        });
        return;
      }

      next();
    };
  }

  private getIdentifier(req: Request): string {
    // Use user ID if authenticated, otherwise fall back to IP
    const userId = (req as any).user?.claims?.sub;
    return userId || req.ip || 'unknown';
  }
}

export const createRateLimiter = (windowMs?: number, maxRequests?: number) => {
  const limiter = new SimpleRateLimiter(windowMs, maxRequests);
  return limiter.middleware();
};

// Preset rate limiters for different use cases
export const strictRateLimit = createRateLimiter(15 * 60 * 1000, 50); // 50 requests per 15 minutes
export const moderateRateLimit = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const lenientRateLimit = createRateLimiter(15 * 60 * 1000, 200); // 200 requests per 15 minutes