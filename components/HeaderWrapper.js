import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import Header from './Header';

const HeaderWrapper = () => {
  useContext(AuthContext); // Just to ensure context is available
  const { pathname } = useRouter();
  return (
    <Header showCompanionLauncher={pathname !== '/kaori-live' && !pathname.startsWith('/admin')} />
  );
};

export default React.memo(HeaderWrapper);
