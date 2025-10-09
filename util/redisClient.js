let redisClient;
(async () => {
  const { createClient } = require("redis");

  redisClient = createClient();

  redisClient.on("error", err => console.error("Redis Client Error"));

  await redisClient.connect(); // Ensure the client is connected
  console.log("Redis Connected");
})();
module.exports = redisClient;
