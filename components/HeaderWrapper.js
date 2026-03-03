import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import Header from './Header';

const HeaderWrapper = () => {
  useContext(AuthContext); // Just to ensure context is available
  return <Header />;
};

export default React.memo(HeaderWrapper);
