let redisClient;
(async () => {
  const { createClient } = require("redis");

  redisClient = createClient({
    username: "default",
    password: "bZryesSIKJPChEE6bVOitUvaKqmgfRTO",
    socket: {
      host: "redis-14410.crce206.ap-south-1-1.ec2.redns.redis-cloud.com",
      port: 14410,
    },
  });

  redisClient.on("error", err => console.error("Redis Client Error"));

  await redisClient.connect(); // Ensure the client is connected
  console.log("Redis Connected");
})();
module.exports = redisClient;
