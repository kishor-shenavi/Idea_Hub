module.exports={
    PORT: 5000,
      JWT_SECRET: process.env.JWT_SECRET ,
      JWT_EXPIRE:process.env.JWT_EXPIRE ||30,
     CLIENT_URL: process.env.CLIENT_URL,
     MONGO_URL: process.env.MONGO_URL,
};

