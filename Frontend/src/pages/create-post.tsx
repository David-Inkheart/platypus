import React from 'react';
import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { Box } from '@chakra-ui/react';
import InputField from '../components/InputField';
import { useCreatePostMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useIsAuth } from '../useIsAuth';
import { withApollo } from '../utils/withApollo';


const CreatePost = () => {
  const router = useRouter();
  useIsAuth();
  const [CreatePost] = useCreatePostMutation();
  return (
    <Layout variant='small'>
      <Formik
          initialValues={{ title: '', text: '' }}
          onSubmit={async (values) => {
            const { errors } = await CreatePost({
              variables: { input: values },
                update: (cache) => {
                  cache.evict({ fieldName: 'posts:{}' });
                }
              });
            if (!errors) {
              router.push('/');
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
                create post
              </Button>
            </Form>
          )}
        </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);