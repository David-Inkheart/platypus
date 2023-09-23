import React from 'react';
import Wrapper, { WrapperVariant } from './Wrapper';
import NavBar from './NavBar';

interface LayoutProps {
  variant?: WrapperVariant;
  children: any;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  variant,
}) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;