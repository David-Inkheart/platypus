import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";

// many to many relationship

@ObjectType()
@Entity()
export class Uphoot extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.uphoots)
  user: User;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post)
  post: Post;
}