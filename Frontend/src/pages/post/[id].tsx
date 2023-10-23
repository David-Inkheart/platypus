import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useRouter } from 'next/router';
import { usePostQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';
import { Heading } from '@chakra-ui/react';

const Post = ({ }) => {
  const router = useRouter();
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });

  return (
    <Layout>
      {fetching
        ? (<div>loading...</div>)
        : !data?.post
          ? (<div>Could not find post</div>)
          : (
            <div>
              <Heading mb={4}>{data.post.title}</Heading>
              {data.post.text}
            </div>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
