import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({ }) => {
  const router = useRouter();
  // Initialize isClient to false on the server side
  const [isClient, setIsClient] = useState(false);
  const [logout, { loading: logoutLoading }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  // get the current user
  const { data, loading }= useMeQuery({
    skip: isServer(), // if isServer is true, pause the query so that it doesn't render on the server side unnecessarily until isServer is false
  });

  useEffect(() => {
    setIsClient(true); //Set isClient to true on the client side
  }, []);

  let body = null;

  // data is loading
  if (loading) {
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
      <Flex align={'center'}>
        <Box ml={"auto"} mr={2} color="white"> Welcome {data.me.username.toLocaleUpperCase()}</Box>
        <Button
          as={Link}
          href='/create-post'
          mx={4}
          color="white"
          _hover={{ color: 'teal', bg: 'white' }}
          variant="outline"
        >
          Create Post
        </Button>
        <Button
          onClick={async () => {
            await logout({});
            await apolloClient.resetStore();
            // router.reload();
          }}
          isLoading={logoutLoading}
          variant="link"
          color="white"
        >
          logout
        </Button>
      </Flex>
    ) : null;
  }

  return (
    <Flex
      zIndex={1}
      position='sticky'
      top={0}
      bg="cyan.900"
      p={4}
    >
      <Flex flex={1} align={'center'} m={'auto'} maxW={800}>
        <Link href='/' color={'white'}>
         <Heading>PlatyPus</Heading>
        </Link>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
