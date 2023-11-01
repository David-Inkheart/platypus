import React, { useState } from 'react';
import { Button, Box } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const forgotPassword = () => {
    const [complete, setComplete] = useState(false);
    const [forgotPassword] = useForgotPasswordMutation();
    return (
  <Wrapper variant='small' >
    <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
            await forgotPassword({ variables:  values });
            setComplete(true);
        }}
    >
        {(props) =>
            complete ? (
                <Box>
                    If an account with that email exists, we sent you an email
                </Box>
        ) : (
        <Form>
          <Box mt={4}>
            <InputField
              name='email'
              placeholder='email'
              label='Email'
              type='email'
            />
            </Box>
          <Button
            mt={4}
            colorScheme='teal'
            isLoading={props.isSubmitting}
            type='submit'
          >
            forgot password
          </Button>
        </Form>
      )}
    </Formik>
  </Wrapper>
  );;
};

export default withApollo({ ssr: false })(forgotPassword);