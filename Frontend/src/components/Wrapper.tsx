import { Box } from '@chakra-ui/react';
import React from 'react';

export type WrapperVariant = 'small' | 'regular';

interface WrapperProps {
  variant?: WrapperVariant;
  children: any;
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant='regular' }) => {
  return (
    <Box mt={8} mx="auto" maxW={variant === 'regular' ? '800px' : '400'} w='100%'>
      {children}
    </Box>
  );
};

export default Wrapper;