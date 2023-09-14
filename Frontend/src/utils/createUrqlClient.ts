import { fetchExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { typedUpdateQuery } from "./typedUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
    cache: 'no-cache' as const,
  },
  exchanges: [cacheExchange({
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
    ssrExchange,
    fetchExchange],
    // suspense: true,
});