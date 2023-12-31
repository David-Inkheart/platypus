"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const dotenv_1 = require("dotenv");
const Uphoot_1 = require("./entities/Uphoot");
(0, dotenv_1.configDotenv)();
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [__dirname + "/migrations/*"],
    entities: [Post_1.Post, User_1.User, Uphoot_1.Uphoot],
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map