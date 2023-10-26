"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("./constants");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const redisClient_1 = __importDefault(require("./redisClient"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const data_source_1 = __importDefault(require("./data-source"));
const createUserLoader_1 = require("./utils/createUserLoader");
const createUphootLoader_1 = require("./utils/createUphootLoader");
(0, dotenv_1.configDotenv)();
const main = async () => {
    const app = (0, express_1.default)();
    const redisStore = new connect_redis_1.default({
        client: redisClient_1.default,
        prefix: "myapp:",
        disableTouch: true,
    });
    app.set('trust proxy', 1);
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: redisStore,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        },
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redisClient: redisClient_1.default,
            userLoader: (0, createUserLoader_1.createUserLoader)(),
            uphootLoader: (0, createUphootLoader_1.createUphootLoader)(),
        })
    });
    await data_source_1.default.initialize()
        .then(() => {
        console.log("Data source initialized.");
    }).catch((err) => {
        console.error(err);
    });
    await data_source_1.default.runMigrations();
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(4000, () => {
        console.log("server started on localhost:4000");
    });
};
main().catch(err => {
    console.error(err);
});
//# sourceMappingURL=index.js.map