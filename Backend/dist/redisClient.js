"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
redisClient.on('connect', () => {
    console.log('Redis client connected');
});
redisClient.on('error', (err) => {
    console.log(`Something went wrong ${err}`);
});
(async () => {
    await redisClient.connect();
})();
exports.default = redisClient;
//# sourceMappingURL=redisClient.js.map