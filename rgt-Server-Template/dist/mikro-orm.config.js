"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const Post_1 = require("./entities/Post");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const User_1 = require("./entities/User");
(0, dotenv_1.configDotenv)();
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post_1.Post, User_1.User],
    dbName: "rgtFullstack",
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    type: "postgresql",
    debug: !constants_1.__prod__,
    allowGlobalContext: true
};
//# sourceMappingURL=mikro-orm.config.js.map