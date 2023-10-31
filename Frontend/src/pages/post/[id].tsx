import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import Layout from '../../components/Layout';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { formatTimestampToHumanDate } from '../../utils/timeStampToDate';
import UpdateDeletePostButtons from '../../components/UpdateDeletePostButtons';

const Post = () => {
  const { data, error, loading } = useGetPostFromUrl();

  if (loading) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (error) {
    return <Layout><div>{error.message}</div></Layout>;
  }

  if (!data?.post) {
    return <Layout><div>Could not find post</div></Layout>;
  }

  const { title, text, createdAt, updatedAt } = data.post;
  const isEdited = updatedAt !== createdAt;

return (
    <Layout>
      <Box
        justifyContent={'center'}
        alignContent={'center'}
        bg="gray.100"
        p={4}
        mb={4}
        borderRadius="md"
      >
        <Heading
          as="h1"
          size="lg"
          mb={4}
          // color="white"
        >
            {title}
          </Heading>
        <Text
          fontSize="lg"
          // color="white"
        >
          {text}
        </Text>
        <Flex align={'center'} >
          {isEdited && (
            <Text 
              fontSize="sm" 
              mt={4} 
              color="gray"
              >
              Edited on {formatTimestampToHumanDate(parseInt(updatedAt))}
            </Text>
          )}
          <Box ml='auto'>
            <UpdateDeletePostButtons id={data.post.id} creatorId={data.post.creator.id} />
          </Box>
        </Flex>
      </Box>
    </Layout>
  );
};

export default Post;

