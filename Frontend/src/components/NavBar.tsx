import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({ }) => {
  // Initialize isClient to false on the server side
  const [isClient, setIsClient] = useState(false);
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  // get the current user
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(), // if isServer is true, pause the query so that it doesn't render on the server side unnecessarily until isServer is false
  });

  useEffect(() => {
    setIsClient(true); //Set isClient to true on the client side
  }, []);

  let body = null;

  // data is loading
  if (fetching) {
    body = null;
    // user not logged in
  } else if (!data?.me) {
    // if isClient is true, render the login and register links on the client side else set body to null
    body = isClient ? (
      <>
        <Link href='/login' mr={2} color="white">Login</Link>
        <Link href='/register' color="white">Register</Link>
      </>
    ) : null;
    // user is logged in
  } else {
    // if isClient is true, render, else set body to null
    body = isClient ? (
      <Flex>
        <Box ml={"auto"} mr={2} color="white"> Welcome {data.me.username}</Box>
        <Button
          onClick={() => {
            logout({});
          }}
          isLoading={logoutFetching}
          variant="link"
          color="white"
        >
          logout
        </Button>
      </Flex>
    ) : null;
  }

  return (
    <Flex zIndex={1} position='sticky' top={0} bg="cyan.900" p={4} ml={"auto"}>
      <Box ml={"auto"}>
        {body}
      </Box>
    </Flex>
  );
};

export default NavBar;
