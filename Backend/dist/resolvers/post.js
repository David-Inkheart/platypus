"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const isAuth_1 = require("../middleware/isAuth");
const postsAccess_1 = require("../data/postsAccess");
const data_source_1 = __importDefault(require("../data-source"));
const User_1 = require("../entities/User");
let PostInput = class PostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    (0, type_graphql_1.InputType)()
], PostInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = exports.PostResolver = class PostResolver {
    textSnippet(post) {
        return post.text.slice(0, 100);
    }
    creator(post, { userLoader }) {
        return userLoader.load(post.creatorId);
    }
    async vote(postId, value, { req }) {
        const isUpHoot = value !== -1;
        const realValue = isUpHoot ? 1 : -1;
        const { userId } = req.session;
        const uphoot = await data_source_1.default.query(`
      select * from uphoot
      where "postId" = ${postId} and "userId" = ${userId}
      for update;
    `);
        if (uphoot && uphoot.value !== realValue) {
            await data_source_1.default.transaction(async (txmng) => {
                await txmng.query(`
          update uphoot
          set value = ${realValue}
          where "userId" = ${userId} and "postId" = ${postId};
        `);
                await txmng.query(`
          update post
          set points = points + ${2 * realValue}
          where id = ${postId};
        `);
            });
            return true;
        }
        else if (!uphoot) {
            await data_source_1.default.transaction(async (txmng) => {
                await txmng.query(`
          insert into uphoot ("userId", "postId", value)
          values (${userId}, ${postId}, ${realValue});
        `);
                await txmng.query(`
          update post
          set points = points + ${realValue}
          where id = ${postId};
        `);
            });
            return true;
        }
        else if (uphoot.value === realValue) {
            await data_source_1.default.transaction(async (txmng) => {
                await txmng.query(`
          delete from uphoot
          where "userId" = ${userId} and "postId" = ${postId};
        `);
                await txmng.query(`
          update post
          set points = points - ${realValue}
          where id = ${postId};
        `);
            });
            return true;
        }
        return false;
    }
    async posts(limit, cursor, { req }) {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replacements = [realLimitPlusOne];
        if (req.session.userId) {
            replacements.push(req.session.userId);
        }
        let cursorIdx = 3;
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIdx = replacements.length;
        }
        const posts = await (0, postsAccess_1.getPostsWithCreator)({ replacements, currentUserId: req.session.userId, cursor, cursorIdx });
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }
    async post(id) {
        const post = await Post_1.Post.findOne({ where: { id } });
        return post || undefined;
    }
    async createPost(input, { req }) {
        return Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
    }
    async updatePost(id, title, text, { req }) {
        const result = await data_source_1.default
            .createQueryBuilder()
            .update(Post_1.Post)
            .set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', {
            id,
            creatorId: req.session.userId,
        })
            .returning('*')
            .execute();
        return result.raw[0];
    }
    async deletePost(id, { req }) {
        try {
            await Post_1.Post.delete({ id, creatorId: req.session.userId });
            return true;
        }
        catch (error) {
            return error;
        }
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "creator", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('cursor', () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('title')),
    __param(2, (0, type_graphql_1.Arg)('text')),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
//# sourceMappingURL=post.js.map