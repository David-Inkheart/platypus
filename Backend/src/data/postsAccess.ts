import AppDataSource from "../data-source";

export const getPostsWithCreator = ({ replacements, currentUserId, cursor, cursorIdx }: { replacements: any[]; currentUserId: number | undefined; cursor: string | null;  cursorIdx: number }) => AppDataSource.query(
      `
        select p.*,
        ${
          currentUserId 
          ? '(select value from uphoot where "userId" = $2 and "postId" = p.id) "voteStatus"' 
          : 'null as "voteStatus"'
        }
        from post p
        ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
        order by p."createdAt" DESC
        limit $1
      `, replacements
    );