import "reflect-metadata"
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getPostsWithCreator } from "../data/postsAccess";
import AppDataSource from "../data-source";
import { Uphoot } from "../entities/Uphoot";

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  text: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post]) // graphql typed field
  posts: Post[] // typescript typed field

  @Field() // graphql field
  hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String) // graphql field resolver
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 100);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth) // Can only vote if you are logged in
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpHoot = value !== -1;
    const realValue = isUpHoot ? 1 : -1;
    const { userId } = req.session

    const uphoot = await Uphoot.findOne({ where: { postId, userId } });

    // if the user has voted on the post before and want to change their vote
    if (uphoot && uphoot.value !== realValue) {
      await AppDataSource.transaction(async (txmng) => {
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
    } else if (!uphoot) {
      // if the user has not voted on the post before
      await AppDataSource.transaction(async (txmng) => {
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
    } else if (uphoot.value === realValue) {
      // if the user has voted on the post before but want to cancel their vote
      await AppDataSource.transaction(async (txmng) => {
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

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    // try to get one more post than the limit to see if there are more posts
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (req.session.userId) {
      replacements.push(req.session.userId);
    }

    let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
    }

    const posts = await getPostsWithCreator({ replacements, currentUserId: req.session.userId, cursor, cursorIdx });
    // console.log("posts: ", posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    const post = await Post.findOne({ where: { id }, relations: ['creator'] });
    return post || undefined;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth) // using an auth middleware in a resolver
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string): Promise<Post | null>
  {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
    ): Promise<boolean> {
    try {
      // delete relational data first if not using cascade way
      // const post = await Post.findOne({ where: { id } });
      // if (!post) {
      //   return false;
      // }
      // if (post.creatorId !== req.session.userId) {
      //   throw new Error('not authorized');
      // }
      // await Uphoot.delete({ postId: id });
      // await Post.delete({ id });

      // delete can be done straight for cascade way
      await Post.delete({ id, creatorId: req.session.userId });
      return true;
    } catch (error) {
      return error
    }
  }
}