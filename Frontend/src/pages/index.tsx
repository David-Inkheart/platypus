import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/createUrqlClient"
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import { Box, Button, Flex, Heading, Link, Stack, Text, others } from "@chakra-ui/react";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 33, cursor: null as null | string
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>Query failed for some reason</div>
  }

  return (
    <Layout>
      <Flex align='center' color='teal'>
        <Heading>PlatyPus</Heading>
        <Link href='/create-post' ml='auto'>Create Post</Link>
      </Flex>
      <br />
      {!data && fetching ?
        (
          <div >loading...</div>
        ) : (
          <Stack spacing={8}>
            {data!.posts.posts.map((p) => 
              (<Box key={p.id} p={5} shadow='md' borderWidth='1px'>
              <Heading fontSize='xl'>{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}...</Text>
                {/* <Text mt={4}>{p.text.slice(0, 50)}...</Text> */}
              </Box>
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
