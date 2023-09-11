import { ChakraProvider } from '@chakra-ui/react'
import { Client, Provider, fetchExchange } from 'urql';
import { AppProps } from 'next/app'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import theme from '../theme'
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';

function typedUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}

const client = new Client({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [cacheExchange({
    updates: {
      Mutation: {
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
      Subscription: {
        subscriptionField: (result, args, cache, info) => {
          // ...
        },
      },
    },
  }), fetchExchange],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
