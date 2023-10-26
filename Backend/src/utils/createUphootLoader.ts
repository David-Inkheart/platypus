import DataLoader from "dataloader";
import { Uphoot } from "../entities/Uphoot";

// This function creates a dataloader that takes in an array of objects with postId and userId and returns an array of users
// This is used to load the vote status of a post
// This is used in the PostResolver
// sample input: [{ postId: 5, userId: 10 }]
// return [{postId: 5, userId: 10, value: 1}]

// [{postId: 5, userId: 10}]
// [{postId: 5, userId: 10, value: 1}]
export const createUphootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Uphoot | null>(
    async (keys) => {
      const updoots = await Uphoot.findByIds(keys as any);
      const updootIdsToUpdoot: Record<string, Uphoot> = {};
      updoots.forEach((uphoot) => {
        updootIdsToUpdoot[`${uphoot.userId}|${uphoot.postId}`] = uphoot;
      });

      return keys.map(
        (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]
      );
    }
  );