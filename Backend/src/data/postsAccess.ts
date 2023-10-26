import AppDataSource from "../data-source";

export const getPostsWithCreator = ({ replacements, currentUserId, cursor, cursorIdx }: { replacements: any[]; currentUserId: number | undefined; cursor: string | null;  cursorIdx: number }) => AppDataSource.query(
      `
        select p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'createdAt', u."createdAt",
          'updatedAt', u."updatedAt"
        ) creator,
        ${
          currentUserId 
          ? '(select value from uphoot where "userId" = $2 and "postId" = p.id) "voteStatus"' 
          : 'null as "voteStatus"'
        }
        from post p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
        order by p."createdAt" DESC
        limit $1
      `, replacements
    );