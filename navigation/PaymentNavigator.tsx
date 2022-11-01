import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useObserver } from 'mobx-react-lite';

import { useStores } from '../mobx/useStores';
import {
  UnitSelector,
  UnitPayments,
  MakePayment,
  ReviewPayment,
  ProcessingPayment,
  PaymentError,
  PaymentHistory,
  SchedulePayment,
  SchedulePaymentError,
  SchedulePaymentInProgress,
  AddPaymentMethod,
  AddPaymentMethodError,
  AddPaymentMethodInProgress,
  ManagePaymentMethods,
  ManageScheduledPayments,
  MissingPaymentIntegrationError,
  RemovePaymentMethodInProgress,
  RemovePaymentMethodError,
} from '../screens';

const PaymentStack = createStackNavigator();
const RootStack = createStackNavigator();

const PaymentStackScreen = (): JSX.Element =>
  useObserver(() => {
    const { units } = useStores();

    return (
      <PaymentStack.Navigator headerMode="none">
        {units.hasMultipleUnits && <PaymentStack.Screen name="UnitSelector" component={UnitSelector} />}
        <PaymentStack.Screen name="UnitPayments" component={UnitPayments} />
        <PaymentStack.Screen name="MakePayment" component={MakePayment} />
        <PaymentStack.Screen name="ReviewPayment" component={ReviewPayment} />
        <PaymentStack.Screen name="ProcessingPayment" component={ProcessingPayment} />
        <PaymentStack.Screen name="PaymentError" component={PaymentError} />
        <PaymentStack.Screen name="PaymentHistory" component={PaymentHistory} />
        <PaymentStack.Screen name="ManageScheduledPayments" component={ManageScheduledPayments} />
        <PaymentStack.Screen name="MissingPaymentIntegrationError" component={MissingPaymentIntegrationError} />
      </PaymentStack.Navigator>
    );
  });

export const PaymentNavigator = (): JSX.Element => {
  return (
    <RootStack.Navigator mode="modal" headerMode="none">
      <RootStack.Screen name="Main" component={PaymentStackScreen} />
      <RootStack.Screen name="SchedulePayment" component={SchedulePayment} />
      <RootStack.Screen name="SchedulePaymentError" component={SchedulePaymentError} />
      <RootStack.Screen name="SchedulePaymentInProgress" component={SchedulePaymentInProgress} />
      <RootStack.Screen name="AddPaymentMethod" component={AddPaymentMethod} />
      <RootStack.Screen name="AddPaymentMethodError" component={AddPaymentMethodError} />
      <RootStack.Screen name="AddPaymentMethodInProgress" component={AddPaymentMethodInProgress} />
      <RootStack.Screen name="ManagePaymentMethods" component={ManagePaymentMethods} />
      <RootStack.Screen name="RemovePaymentMethodInProgress" component={RemovePaymentMethodInProgress} />
      <RootStack.Screen name="RemovePaymentMethodError" component={RemovePaymentMethodError} />
    </RootStack.Navigator>
  );
};
