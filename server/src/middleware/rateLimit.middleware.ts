import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 uploads per IP per hour
  message: {
    error: 'Too many uploads from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

export default rateLimiter;
