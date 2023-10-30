import "reflect-metadata"
import { COOKIE_NAME, __prod__ } from "./constants";
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
import AppDataSource from "./data-source";
import { createUserLoader } from "./utils/createUserLoader";
import { createUphootLoader } from "./utils/createUphootLoader";

configDotenv();

const main = async () => {

  const app = express();

  const port = process.env.PORT;

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
    disableTouch: true,
  })

  app.set('trust proxy', 1);

  app.use(
    cors({
      // origin: '*',
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
        httpOnly: true, // required: http only cookie
        // samesite: "none", for graphql playground
        sameSite: "lax", // || none. Optional: csrf 
        // secure: false, // for localhost
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? ".david-inkheart.tech" : undefined,
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
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redisClient,
      userLoader: createUserLoader(),
      uphootLoader: createUphootLoader(),
    }),
    // cache: "bounded",
    // persistedQueries: false
  });

  await AppDataSource.initialize()
    .then(() => {
      console.log("Data source initialized.");
    }
  ).catch((err) => {
    console.error(err);
  });

  // if data source is not initialized, run migrations. Incase of an error, coment out the line below or retwea data source initialization
  await AppDataSource.runMigrations();

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    console.log(`server started on localhost:${port}`);
  });
}

main().catch(err => {
  console.error(err);
});
