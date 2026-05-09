const { default: Redis } = require("ioredis")

const redis = new Redis()


redis.on("connect", () => {
    console.log('✅ Redis connected');
})
    .on("error", () => {
        console.error('❌ Redis error:', err);
    })

module.exports = redis    