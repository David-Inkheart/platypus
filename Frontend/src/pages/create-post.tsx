import React, { useEffect } from 'react';
import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { Box } from '@chakra-ui/react';
import InputField from '../components/InputField';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import Layout from '../components/Layout';


const CreatePost: React.FC<{}> = ({ }) => {
  const [{data, fetching}] = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace('/login');
    }
  }
  , [fetching, data, router]);
  const [, CreatePost] = useCreatePostMutation();
  return (
    <Layout variant='small'>
      <Formik
          initialValues={{ title: '', text: '' }}
          onSubmit={async (values) => {
            const { error } = await CreatePost({ input: values });
            if (!error) {
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

export default withUrqlClient(createUrqlClient, { ssr: false })(CreatePost);