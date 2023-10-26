import { Request, Response } from "express";
import redisClient from "./redisClient";
import { createUserLoader } from "./utils/createUserLoader";
import { createUphootLoader } from "./utils/createUphootLoader";

export type MyContext = {
  req: Request & { session: Request["session"] & { userId?: number } };
  res: Response;
  redisClient: typeof redisClient;
  // userLoader: DataLoader<number, User, number>
  // an easier way to get the type
  userLoader: ReturnType<typeof createUserLoader>
  uphootLoader: ReturnType<typeof createUphootLoader>
};
