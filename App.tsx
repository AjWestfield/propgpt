import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainNavigator } from './navigation/MainNavigator';
import { MyPicksProvider } from './contexts/MyPicksContext';

declare global {
  // Hermes throws ReferenceErrors if a legacy global is referenced but undefined
  // Older builds expected a FilterPills component, so we provide a safe noop.
  // eslint-disable-next-line no-var
  var FilterPills: any;
}

if (typeof globalThis.FilterPills === 'undefined') {
  globalThis.FilterPills = () => null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer>
        <MyPicksProvider>
          <MainNavigator />
        </MyPicksProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
