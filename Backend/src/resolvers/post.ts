import "reflect-metadata"
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
// import { getPostsWithCreator } from "../data/postsAccess";
import AppDataSource from "../data-source";
import { User } from "../entities/User";
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

  // FieldResolver can be used to resolve a field that is not in the entity, but has a relation to the entity
  // and it only runs when the field is requested
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { uphootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const uphoot = await uphootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return uphoot ? uphoot.value : null;
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

    // raw sql to select for update so that we can lock the row
    // const uphoot = await AppDataSource.query(`
    //   select * from uphoot
    //   where "postId" = ${postId} and "userId" = ${userId}
    //   for update;
    // `);
    const uphoot = await Uphoot.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (uphoot && uphoot.value !== realValue) {
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
    update uphoot
    set value = $1
    where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!uphoot) {
      // has never voted before
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
    insert into uphoot ("userId", "postId", value)
    values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
    update post
    set points = points + $1
    where id = $2
      `,
          [realValue, postId]
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    // try to get one more post than the limit to see if there are more posts
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await AppDataSource.query(
      `select p.*
      from post p
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
        replacements
    );

    // const qb = AppDataSource
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(reaLimitPlusOne);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();
    // console.log("posts: ", posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | null> {
    return Post.findOneBy({ id })
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
) : Promise<Post | null>
  {
  const result =  await AppDataSource
    .createQueryBuilder()
    .update(Post)
    .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
    .returning('*')
    .execute()

    return result.raw[0];
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