import { cacheExchange } from "@urql/exchange-graphcache";
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
    errorExchange,
    ssrExchange,
    fetchExchange],
});