import Redis from "ioredis";

const redisClient = new Redis({
  host: "medmatch-dr-hcb6i5.serverless.eun1.cache.amazonaws.com",
  port: 6379,
  tls: {},
});

export default redisClient;
