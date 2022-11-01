import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useObserver } from 'mobx-react-lite';
import {
  Maintenance,
  MaintenanceTicket,
  CreateMaintenanceRequest,
  CreateMaintenanceRequestInProgress,
  CreateMaintenanceRequestFailed,
} from '../screens';

const MaintenanceStack = createStackNavigator();
const RootStack = createStackNavigator();

export const MaintenanceStackScreen = (): JSX.Element =>
  useObserver(() => {
    return (
      <MaintenanceStack.Navigator headerMode="none">
        <MaintenanceStack.Screen name="Maintenance" component={Maintenance} />
        <MaintenanceStack.Screen name="MaintenanceTicket" component={MaintenanceTicket} />
      </MaintenanceStack.Navigator>
    );
  });

export const MaintenanceNavigator = (): JSX.Element => {
  return (
    <RootStack.Navigator mode="modal" headerMode="none">
      <RootStack.Screen name="Main" component={MaintenanceStackScreen} />
      <RootStack.Screen name="CreateMaintenanceRequest" component={CreateMaintenanceRequest} />
      <RootStack.Screen name="CreateMaintenanceRequestInProgress" component={CreateMaintenanceRequestInProgress} />
      <RootStack.Screen name="CreateMaintenanceRequestFailed" component={CreateMaintenanceRequestFailed} />
    </RootStack.Navigator>
  );
};
