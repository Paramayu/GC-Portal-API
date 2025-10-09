const redis = require("./redisClient");
const otpRateLimit = ({ windowSeconds = 120 } = {}) => {
  return async (req, res, next) => {
    try {
      // Get client IP — works behind proxies if you set trust proxy
      const ip = (
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        ""
      )
        .split(",")[0]
        .trim();

      if (!ip)
        return res.status(400).json({ error: "Cannot determine client IP" });

      const key = `otp:ip:${ip}`;

      // Attempt to set the key in Redis with NX (only set if it does not exist) and EX (expire in 120 seconds)
      const result = await redis.set(key, "1", {
        EX: windowSeconds, // TTL in seconds
        NX: true, // Only set if not exists
      });

      if (result === null) {
        // Key exists → user already requested OTP recently
        const ttl = await redis.ttl(key); // get remaining time
        return res.status(429).json({
          error: "Too many requests",
          timeRemaining: ttl,
        });
      }

      // Key set successfully → allow OTP request
      next();
    } catch (err) {
      console.error("OTP rate limit error:", err);
      // Fail-open: allow the request if Redis is down, to avoid blocking legit users
      next();
    }
  };
};
module.exports = otpRateLimit;
