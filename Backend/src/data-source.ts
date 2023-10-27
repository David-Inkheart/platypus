import "reflect-metadata"
import { DataSource } from 'typeorm'
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { configDotenv } from "dotenv";
import { Uphoot } from "./entities/Uphoot";

configDotenv();

const AppDataSource = new DataSource({
  type: "postgres",
  // database: 'rgtFullstack2',
  // username: process.env.POSTGRES_USER,
  // password: process.env.POSTGRES_PASSWORD,
  url: process.env.DATABASE_URL,
  logging: true,
  // synchronize: true,
  migrations: [__dirname + "/migrations/*"], // path to migrations
  entities: [Post, User, Uphoot],
});

export default AppDataSource;