import React from 'react';
import RootNavigator from '../navigation/RootNavigator';
import AppProviders from './AppProviders';


export default function App() {
  return (
    <AppProviders>
      <RootNavigator/>
    </AppProviders>
  );
}
