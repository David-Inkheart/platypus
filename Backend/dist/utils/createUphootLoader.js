"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUphootLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Uphoot_1 = require("../entities/Uphoot");
const createUphootLoader = () => new dataloader_1.default(async (keys) => {
    const updoots = await Uphoot_1.Uphoot.findByIds(keys);
    const updootIdsToUpdoot = {};
    updoots.forEach((uphoot) => {
        updootIdsToUpdoot[`${uphoot.userId}|${uphoot.postId}`] = uphoot;
    });
    return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
});
exports.createUphootLoader = createUphootLoader;
//# sourceMappingURL=createUphootLoader.js.map