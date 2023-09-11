import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import RedisStore from "connect-redis"
import session from "express-session"
import redisClient from "./redisClient";
import { configDotenv } from "dotenv";
import { MyContext } from "./types";
import cors from "cors";

configDotenv();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  // Initialize redis store.
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
    disableTouch: true,
  })

  app.set('trust proxy', 1);

  // Initialize cors.
  app.use(
    cors({
      // origin: '*',
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Initialize express sesssion storage.
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // required: http only cookie
        // samesite: "none", for graphql playground
        sameSite: "lax", // || none. Optional: csrf 
        secure: false, // for localhost
        // secure: __prod__, // cookie only works in https
      },
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESSION_SECRET as string,
    })
  )

  // const corsOptions = {
  //   origin: process.env.CORS_ORIGIN,
  // origin: '*',
  //   credentials: true,
  // };

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
}

main().catch(err => {
  console.error(err);
});
