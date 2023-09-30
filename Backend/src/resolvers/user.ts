import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { } from 'typeorm'
import AppDataSource from "../data-source";

@ObjectType()
  class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
  }

@ObjectType()
  class UserResponse {
    @Field( () => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field( () => User, { nullable: true })
    user?: User;
  }

@Resolver(User)
export class UserResolver {

  @FieldResolver(() => String) // graphql field resolver
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // it's fine to show the current user their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user cannot someone else's email
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redisClient, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 2'
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redisClient.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired'
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne({ where: { id : userIdNum } });
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists'
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);

    await User.update({ id : userIdNum }, { password: user.password });

    redisClient.del(key);

    // log in user after change password
    req.session.userId = user.id;

    return { user };
  }
    
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redisClient }: MyContext,
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // email not in db
      return true;
    }

    const token = v4();
    const key = FORGET_PASSWORD_PREFIX + token;
    const value = String(user.id);

    await redisClient.setEx(key, 600, value); // 10 minutes

    sendEmail({
      to: email,
      subject: "Change Password",
      html: `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    });

    return true;
  }

  @Query(() => User, { nullable: true })
  me(
    @Ctx() { req }: MyContext) {
    // console.log('session: ', req.session);
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne({ where: { id : req.session.userId } });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    // const user = User.create({
    //   username: options.username,
    //   password: hashedPassword,
    //   email: options.email,
    // }).save();

    // alternative way of creating a user with a query builder
    let user;
    try {
     const result =  await AppDataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          username: options.username,
          password: hashedPassword,
          email: options.email,
        }
      ])
       .returning("*")
        .execute();
      user = result.raw[0];
    } catch (error) {
      console.log('error: ', error);
      // duplicate username error
      if (error.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already exists'
            }
          ]
        };
      }
    }
    // keeps user logged in
    req.session.userId = user.id;
    
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where:
        usernameOrEmail.includes('@')
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
    });
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'that username or email does not exist'
          }
        ]
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password'
          }
        ]
      };
    }

    // this will set a cookie (user id )on the user and keep them logged in
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise((resolve) => req.session.destroy((err: any) => {
      res.clearCookie(COOKIE_NAME);
      if (err) {
        console.log(err);
        resolve(false);
        return;
      }
      resolve(true);
    }));
  }
}