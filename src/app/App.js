import React from 'react';
import RootNavigator from '../navigation/RootNavigator';
import AppProviders from './AppProviders';
import "../../global.css"


export default function App() {
  return (
    <AppProviders>
      <RootNavigator/>
    </AppProviders>
  );
}
