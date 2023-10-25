"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsWithCreator = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const getPostsWithCreator = ({ replacements, currentUserId, cursor, cursorIdx }) => data_source_1.default.query(`
        select p.*,
        ${currentUserId
    ? '(select value from uphoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
    : 'null as "voteStatus"'}
        from post p
        ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
        order by p."createdAt" DESC
        limit $1
      `, replacements);
exports.getPostsWithCreator = getPostsWithCreator;
//# sourceMappingURL=postsAccess.js.map