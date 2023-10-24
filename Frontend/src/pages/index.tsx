import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/createUrqlClient"
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import NextLink from 'next/link';
import { Box, Button, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { Link as NewLink } from '@chakra-ui/next-js'
import { useState } from "react";
import { VoteSection } from "../components/VoteSection";
import { DeleteIcon } from "@chakra-ui/icons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [,deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>Query failed for some reason</div>
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
                  {/* This is a hack to get the link to work with the NextLink component */}
                    <Heading fontSize='xl'>{p.title}</Heading>
                  </NewLink>
                  <Text mt={4}>{p.textSnippet}...</Text>
                  {/* <Text mt={4}>{p.text.slice(0, 100)}...</Text> */}
                  <Flex align={'center'}>
                  <Text color={'gray'}>posted by {p.creator.username}</Text>
                    <IconButton
                      ml={'auto'}
                      colorScheme={'red'}
                      variant={'outline'}
                      aria-label="Delete Post"
                      icon={<DeleteIcon color={'red'} />}
                      size={"sm"}
                      // onClick={() => console.log('TAda!!!')}
                      onClick={() => deletePost({ id: p.id })}
                    />
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
