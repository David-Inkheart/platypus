import { Button, Box, } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React from 'react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface loginProps {}

const Login: React.FC<loginProps> = ({ }) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
return (
  <Wrapper variant='small' >
    <Formik
      initialValues={{ usernameOrEmail: '', password: '' }}
      onSubmit={async (values, {setErrors}) => {
        const response = await login(values);
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
            name='usernameOrEmail'
            placeholder='username or email'
            label='Username or Email'
            // value={props.values.usernameOrEmail}
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

export default withUrqlClient(createUrqlClient)(Login);