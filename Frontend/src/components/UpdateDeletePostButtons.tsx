import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Link as NewLink } from '@chakra-ui/next-js';
import { Box, IconButton } from "@chakra-ui/react";
import NextLink from 'next/link';
import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface UpdateDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const UpdateDeletePostButtons: React.FC<UpdateDeletePostButtonsProps> = ({ id, creatorId }) => {
  const [{ data: meData }] = useMeQuery();

  const [, deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
      <Box>
        <NewLink
            as={NextLink}
            href={`/post/update/${id}`}
        >
          <IconButton
            mr={4}
            colorScheme={'teal'}
            variant={'outline'}
            aria-label="Edit Post"
            icon={<EditIcon color={'teal'} />}
            size={"sm"}
          />
        </NewLink>
        <IconButton
          colorScheme={'red'}
          variant={'outline'}
          aria-label="Delete Post"
          icon={<DeleteIcon color={'red'} />}
          size={"sm"}
          onClick={() => deletePost({ id })}
        />
    </Box>
  )
};

export default UpdateDeletePostButtons;