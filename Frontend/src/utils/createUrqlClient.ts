import { Resolver, cacheExchange, Cache } from "@urql/exchange-graphcache";
import { Exchange, fetchExchange } from "urql";
import { gql } from '@urql/core';
import { pipe, tap } from 'wonka';
import Router from "next/router";
import { DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from "../generated/graphql";
import { typedUpdateQuery } from "./typedUpdateQuery";
import { isServer } from "./isServer";

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login');
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${JSON.stringify(fieldArgs)})`;
    const isItinTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, 'posts');
    info.partial = !isItinTheCache; // if it's not in the cache, we set partial to true
    let hasMore = true;
    // check if data is in cache and return it if it is
    const results: string[] = [];
    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results,
    };
  };
};

function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
  fieldInfos.forEach(fi => {
    cache.invalidate('Query', 'posts', fi.arguments || {});
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie?.split(';').find((c: string) => c.trim().startsWith('Sid='));
  }
  return {
  url: process.env.NEXT_PUBLIC_API_URL as string,
  fetchOptions: {
    credentials: 'include' as const,
    cache: 'no-cache' as const,
    headers: cookie ? {
      cookie,
    } : undefined,
  },
  exchanges: [
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        }
      },
      updates: {
        Mutation: {
          deletePost: (_result, args, cache, info) => {
            cache.invalidate({
              __typename: 'Post',
              id: (args as DeletePostMutationVariables).id
            });
          },
          vote: (_result, args, cache, info) => {
            // to update the cache, we need to invalidate the query
            const { postId, value } = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                fragment _ on Post{
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
            );
            // console.log('data: ', data);
            if (data) {
              if (data.voteStatus === value) {
                return;
              }
              const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value } as any
              );
            }
          },
          createPost: (_result, args, cache, info) => {
            // to update the cache, we need to invalidate the query
            invalidateAllPosts(cache);
          },
          logout: (result, args, cache, info) => {
            typedUpdateQuery<LogoutMutation, MeQuery>(cache,
              { query: MeDocument },
              result,
              (res, qry) => {
              if (res.logout) {
                return {
                  me: null,
                };
              } else {
                return qry;
              }
            }
          );
          invalidateAllPosts(cache);
        },
        login: (result, args, cache, info) => {
          typedUpdateQuery<LoginMutation, MeQuery>(cache,
            { query: MeDocument },
            result,
            (res, qry) => {
              if (res.login.errors) {
                return qry;
              } else {
                return {
                  me: res.login.user,
                };
              }
          });
        },
        register: (result, args, cache, info) => {
          typedUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument }, result, (res, qry) => {
            if (res.register.errors) {
              return qry;
            } else {
              return {
                me: res.register.user,
              };
            }
          });
        },
      },
    },
  }),
    errorExchange,
    ssrExchange,
      fetchExchange],
  };
}