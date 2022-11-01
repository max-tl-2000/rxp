import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { PostDetails, Home } from '../screens';

const Stack = createStackNavigator();

export const HomeNavigator = (): JSX.Element => (
  <Stack.Navigator headerMode="none" screenOptions={{ animationEnabled: false }}>
    <Stack.Screen name="Feed" component={Home} />
    <Stack.Screen name="PostDetails" component={PostDetails} />
  </Stack.Navigator>
);
