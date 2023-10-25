import { Link as NewLink } from '@chakra-ui/next-js';
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from 'next/link';
import { useState } from "react";
import Layout from "../components/Layout";
import UpdateDeletePostButtons from "../components/UpdateDeletePostButtons";
import { VoteSection } from "../components/VoteSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string
  });

  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <div>
        <div>you got query failed for some reason</div>        
        <div>{error?.message}</div>
      </div>
    )
  }

  return (
    <Layout>
      {!data && fetching ?
        (
          <div >loading...</div>
        ) : (
          <Stack spacing={8}>
            {data!.posts.posts.map((p) => 
              !p ? null : // deleted post will be null and have id of null, so we avoid it so as to avoid error 
              (<Flex align={'center'} key={p.id} p={5} shadow='md'  borderWidth='1px'>
                <VoteSection post={p} />
                <Box ml={10}  flex={'1'}>
                  <NewLink
                    as={NextLink}
                    href={`/post/${p.id}`}
                  >
                  {/* NewLink is a hack to get the link to work with the NextLink component */}
                    <Heading fontSize='xl'>{p.title}</Heading>
                  </NewLink>
                  <Text mt={4}>{p.textSnippet}...</Text>
                  <Flex align={'center'}>
                    <Text color={'gray'}>posted by {p.creator.username}</Text>
                    <Box ml='auto'>
                      <UpdateDeletePostButtons id={p.id} creatorId={p.creator.id} />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            ))}
          </Stack>
        )
      }
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            }
            isLoading={fetching}
            m='auto' my={8}
            colorScheme='teal'
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  )
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Index)
