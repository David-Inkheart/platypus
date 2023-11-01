import { ApolloClient, InMemoryCache } from "@apollo/client";
import createWithApollo from "./createWithApollo";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";

const createClient = (ctx: NextPageContext | undefined) => new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: 'include',
  headers: {
    cookie: (typeof window === 'undefined' ? ctx?.req?.headers.cookie : undefined) || '',
  },
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

export const withApollo = createWithApollo(createClient);