import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import theme from '../theme';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { PaginatedPosts } from '../generated/graphql';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: 'include',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            // keyArgs can contain the variables that are passed to the query if we want to have different queries with different variables
            keyArgs: [], // tells apollo how to merge the results of the query
            merge(
              existing: PaginatedPosts | undefined,
              incoming: PaginatedPosts
            ): PaginatedPosts {
              return {
                ...incoming,
                posts: [
                  ...(existing?.posts || []),
                  ...incoming.posts
                ],
              };
            }
          },
        },
      },
    },
  }),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
