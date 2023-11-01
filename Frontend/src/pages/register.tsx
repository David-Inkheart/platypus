import { Button, Box, } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React from 'react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withApollo } from '../utils/withApollo';

const Register = () => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (values, {setErrors}) => {
          const response = await register({
            variables: { options: values },
            update: (cache, {data}) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.register.user,
                },
              });
              // cache.evict({ fieldName: 'posts:{}' });
            }
          });
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push('/');
          }
        }}
      >
        {(props) => (
          <Form>
            <InputField
              name='username'
              placeholder='username'
              label='Username'
              // value={props.values.username}
              // onChange={props.handleChange}
              // onBlur={handleChange}
            />
            <Box mt={4}>
              <InputField
                name='email'
                placeholder='email'
                label='Email'
                // value={props.values.password}
                // onChange={props.handleChange}
                type='email'
                // onBlur={handleChange}
              />
            </Box>
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label='Password'
                // value={props.values.password}
                // onChange={props.handleChange}
                type='password'
                // onBlur={handleChange}
              />
            </Box>
            <Button
              mt={4}
              colorScheme='teal'
              isLoading={props.isSubmitting}
              type='submit'
            >
              Sign Up
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
    );
    
};

export default withApollo({ ssr: false })(Register);