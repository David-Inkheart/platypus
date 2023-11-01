import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, VoteMutation, useMeQuery, useVoteMutation } from '../generated/graphql';
import gql from 'graphql-tag';
import { ApolloCache } from '@apollo/client';
import { useRouter } from 'next/router';

interface VoteSectionProps {
  // post: PostsQuery['posts']['posts'][0];
  post: PostSnippetFragment;
}
  
const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
}

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const { data: authUser } = useMeQuery();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<'upvote-loading' | 'downvote-loading' | 'not-loading'>('not-loading');

  const [vote] = useVoteMutation();

  const isAuthenticated = () => {
    if (authUser?.me) {
      return true;
    }
    return false;
  }

  return (
      <Flex direction={"column"} align={'center'}>
        <IconButton
          onClick={async () => {
            if (!isAuthenticated()) {
              router.push('/login');
              return;
            }
            if (post.voteStatus === 1) {
              return;
            }
            setLoadingState('upvote-loading');
            await vote({
              variables: {
                postId: post.id,
                value: 1,
              }, 
              update: (cache) => updateAfterVote(1, post.id, cache)
            });
            setLoadingState('not-loading');
          }}
          colorScheme={post.voteStatus === 1 ? "teal" : undefined}
          // variant={post.voteStatus === 1 ? "solid" : undefined}
          aria-label="Upvote"
          icon={<ChevronUpIcon color={'teal.900'} />}
          size={"sm"}
          isLoading={loadingState === 'upvote-loading'}
        />
        <Text>{post.points}</Text>
        <IconButton
          onClick={async () => {
            if (!isAuthenticated()) {
              router.push('/login');
              return;
            }
            if (post.voteStatus === -1) {
              return;
            }
            setLoadingState('downvote-loading');
          await vote({
            variables: {
              postId: post.id,
              value: -1,
            },
            update: (cache) => updateAfterVote(-1, post.id, cache)
          });
            setLoadingState('not-loading');
          }}
          colorScheme={post.voteStatus === -1 ? "orange" : undefined}
          // variant="solid"
          aria-label="Downvote"
          icon={<ChevronDownIcon color={'teal.900'} />}
          size={"sm"}
          isLoading={loadingState === 'downvote-loading'}
        />
      </Flex>
    );
};