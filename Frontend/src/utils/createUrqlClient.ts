import { Resolver, cacheExchange } from "@urql/exchange-graphcache";
import { Exchange, fetchExchange } from "urql";
import { pipe, tap } from 'wonka';
import Router from "next/router";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";
import { typedUpdateQuery } from "./typedUpdateQuery";

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
  

  //   const visited = new Set();
  //   let result: NullArray<string> = [];
  //   let prevOffset: number | null = null;

  //   for (let i = 0; i < size; i++) {
  //     const { fieldKey, arguments: args } = fieldInfos[i];
  //     if (args === null || !compareArgs(fieldArgs, args)) {
  //       continue;
  //     }

  //     const links = cache.resolve(entityKey, fieldKey) as string[];
  //     const currentOffset = args[cursorArgument];

  //     if (
  //       links === null ||
  //       links.length === 0 ||
  //       typeof currentOffset !== 'number'
  //     ) {
  //       continue;
  //     }

  //     const tempResult: NullArray<string> = [];

  //     for (let j = 0; j < links.length; j++) {
  //       const link = links[j];
  //       if (visited.has(link)) continue;
  //       tempResult.push(link);
  //       visited.add(link);
  //     }

  //     if (
  //       (!prevOffset || currentOffset > prevOffset) ===
  //       (mergeMode === 'after')
  //     ) {
  //       result = [...result, ...tempResult];
  //     } else {
  //       result = [...tempResult, ...result];
  //     }

  //     prevOffset = currentOffset;
  //   }

  //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
  //   if (hasCurrentPage) {
  //     return result;
  //   } else if (!(info as any).store.schema) {
  //     return undefined;
  //   } else {
  //     info.partial = true;
  //     return result;
  //   }
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
    cache: 'no-cache' as const,
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
          });
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
});