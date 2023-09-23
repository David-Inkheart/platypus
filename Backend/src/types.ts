import { Request, Response } from "express";
import redisClient from "./redisClient";

export type MyContext = {
  req: Request & { session: Request["session"] & { userId?: number } };
  res: Response;
  redisClient: typeof redisClient;
};