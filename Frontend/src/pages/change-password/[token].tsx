import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper variant='small' >
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, {setErrors}) => {
          const response = await changePassword({ newPassword: values.newPassword, token: typeof router.query.token === 'string' ? router.query.token : '' });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {(props) => (
          <Form>
            <InputField
              name='newPassword'
              placeholder='new password'
              label='New Password'
              type='password'
            />
            {tokenError ? (
              <Box mt={4}>
                <Box mr={2} color='red'>{tokenError}!</Box>
                <Link color='teal' href='/forgot-password'>Get a new password here</Link>
              </Box>
            ) : null}
            <Button
              mt={4}
              colorScheme='teal'
              isLoading={props.isSubmitting}
              type='submit'
            >
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);