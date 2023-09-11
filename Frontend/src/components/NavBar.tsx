import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
// import NextLink from 'next/link';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  // data is loading
  if (fetching) {
    body = null;
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <Link href='/login' mr={2} color="white">Login</Link>
        <Link href='/register'color="white">Register</Link>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex>
        <Box ml={"auto"} mr={2} color="white"> Welcome {data.me.username}</Box>
        <Button
          onClick={() => {
            logout({});
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="purple" p={4} ml={"auto"}>
      <Box ml={"auto"}>
        {body}
      </Box>
    </Flex>
  );
};

export default NavBar;