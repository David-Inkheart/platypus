import { Button, Box, } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React from 'react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface loginProps {}

const Login: React.FC<loginProps> = ({ }) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, {setErrors}) => {
          const response = await login({ options: values });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
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
              Sign in
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
    );
    
};

export default Login;