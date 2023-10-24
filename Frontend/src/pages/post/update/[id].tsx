import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useRouter } from 'next/router';

const UpdatePost = ({ }) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1, // pause the query if the id is -1
    variables: {
      id: intId,
    },
  });
  const [, UpdatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>
  }

  if (!data?.post) {
    return <Layout>
      <div>Could not find post</div>
    </Layout>
  }
  
  return <Layout variant='small'>
      <Formik
          initialValues={{ title: data.post.title, text: data.post.text }}
          onSubmit={async (values) => {
            if (values.title === data?.post?.title && values.text === data?.post?.text) {
              return;
            }
            if (values.title === '' || values.text === '') {
              return;
            }
            const { error } = await UpdatePost({ id:  intId, ...values });
            if (!error) {
              // router.push('/');
              router.back();
            }
          }}
        >
          {(props) => (
            <Form>
              <InputField
                name='title'
                placeholder='title'
              label='Title'
              type='title'
              />
              <Box mt={4}>
              <InputField
                textarea
                name='text'
                placeholder='write something...'
                label='Body'
                type='text'
                />
              </Box>
              <Button
            mt={4}
              colorScheme='teal'
              isLoading={props.isSubmitting}
              type='submit'
              >
                update post
              </Button>
            </Form>
          )}
        </Formik>
    </Layout>
};

export default withUrqlClient(createUrqlClient, { ssr: true })(UpdatePost);
