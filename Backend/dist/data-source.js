"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'rgtFullstack2',
    logging: true,
    synchronize: true,
    entities: [Post_1.Post, User_1.User],
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map