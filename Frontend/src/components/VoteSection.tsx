import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface VoteSectionProps {
  // post: PostsQuery['posts']['posts'][0];
  post: PostSnippetFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<'upvote-loading' | 'downvote-loading' | 'not-loading'>('not-loading');
  const [, vote] = useVoteMutation();
  return (
      <Flex direction={"column"} align={'center'}>
        <IconButton
          colorScheme={post.voteStatus === 1 ? "teal" : undefined}
          // variant={post.voteStatus === 1 ? "solid" : undefined}
          aria-label="Upvote"
          icon={<ChevronUpIcon color={'teal.900'} />}
          size={"sm"}
        onClick={async () => {
            if (post.voteStatus === 1) {
              return;
            }
            setLoadingState('upvote-loading');
            await vote({
              postId: post.id,
              value: 1,
            });
            setLoadingState('not-loading');
          }}
          isLoading={loadingState === 'upvote-loading'}
        />
        <Text>{post.points}</Text>
        <IconButton
          colorScheme={post.voteStatus === -1 ? "orange" : undefined}
          // variant="solid"
          aria-label="Downvote"
          icon={<ChevronDownIcon color={'teal.900'} />}
          size={"sm"}
        onClick={async () => {
            if (post.voteStatus === -1) {
              return;
            }
            setLoadingState('downvote-loading');
            await vote({
              postId: post.id,
              value: -1,
            });
            setLoadingState('not-loading');
          }}
          isLoading={loadingState === 'downvote-loading'}
        />
      </Flex>
    );
};