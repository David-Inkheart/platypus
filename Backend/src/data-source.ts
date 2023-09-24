import "reflect-metadata"
import { DataSource } from 'typeorm'
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { configDotenv } from "dotenv";

configDotenv();

const AppDataSource = new DataSource({
  type: "postgres",
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'rgtFullstack2',
  logging: true,
  synchronize: true,
  migrations: [__dirname + "/migrations/*"], // path to migrations
  entities: [Post, User],
});

export default AppDataSource;