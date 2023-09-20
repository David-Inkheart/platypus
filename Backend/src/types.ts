import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import redisClient from "./redisClient";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Request["session"] & { userId?: number } };
  res: Response;
  redisClient: typeof redisClient;
};