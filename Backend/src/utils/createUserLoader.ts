import DataLoader from "dataloader";
import { User } from "../entities/User";

// This function is used to create a user loader
// It Batch loads users by their id
// it takes in an array of ids and returns an array of users
// e.g. [1, 2, 3] => [{id: 1, username: "user1"}, {id: 2, username: "user2"}, {id: 3, username: "user3"}]
// It is passed into the context of the apollo server
// and then used in the post resolver to batch load the creator of the post
// This is to prevent n+1 problem e.g. if we have 100 posts and we want to get the creator of each post
// we will have to make 100 queries to the database
// with the user loader, we can batch load the creator of each post
// by using the user loader
// we will only make 1 query to the database and the user loader will return an array of users and we can match the user to the post and return the post with the creator
// [1, 78, 8, 9]
// [{id: 1, username: 'tim'}, {}, {}, {}]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    // console.log("userIds", userIds);
    // console.log("map", userIdToUser);
    // console.log("sortedUsers", sortedUsers);
    return sortedUsers;
  });
