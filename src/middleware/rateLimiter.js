const redis = require('../config/redis');
const ApiError = require('../utils/ApiError');

/**
 * میدل‌ور محدودیت نرخ با استفاده از Redis
 * @param {number} maxRequests - حداکثر تعداد درخواست مجاز
 * @param {number} windowSeconds - بازه زمانی به ثانیه
 * @returns {Function} میدل‌ور اکسپرس
 */
const rateLimiter = (maxRequests = 10, windowSeconds = 60) => {
    return async (req, res, next) => {
        try {
            const ip = req.ip || req.connection.remoteAddress;
            const endpoint = req.originalUrl;
            const key = `rate:${ip}:${endpoint}`;

            const current = await redis.incr(key);
            if (current === 1) {
                // چون اگر اولین درخواست باشد کلید ساخته شده انقضا ندارد.
                await redis.expire(key, windowSeconds);
            }

            if (current > maxRequests) {
                const ttl = await redis.ttl(key);
                throw new ApiError(
                    429,
                    `تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ${ttl} ثانیه دیگر تلاش کنید`
                );
            }

            next();
        } catch (err) {
            if (err instanceof ApiError) return next(err);
            // در صورت خطای Redis، بهتر است درخواست را مسدود نکنیم
            next();
        }
    };
};

module.exports = rateLimiter;