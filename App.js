import React from 'react';
import { StatusBar } from 'expo-status-bar';
import TestStartRouteButton from './components/TestStartRouteButton';

export default function App() {
  return (
    <>
      <TestStartRouteButton />
      <StatusBar style="auto" />
    </>
  );
}
