import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator, CardStyleInterpolators, StackHeaderProps } from '@react-navigation/stack';
import { useObserver } from 'mobx-react-lite';

import { Appbar } from 'react-native-paper';
import { useStores } from '../mobx/useStores';
import { DrawerContent } from './DrawerContent';
import { PaymentNavigator } from './PaymentNavigator';
import { HomeNavigator } from './HomeNavigator';

import { MaintenanceNavigator } from './MaintenanceNavigator';
import {
  SignIn,
  Messages,
  Settings,
  ComponentsDemo,
  SignInPassword,
  FirstTimeUser,
  ResetLinkSent,
  CreatePassword,
  InvitationLinkExpired,
  RegistrationCompleted,
  ResetPassword,
  ResetLinkExpired,
  About,
  Acknowledgements,
  UnsubscribeComms,
  DeclinedTransactionInfo,
  PostPreview,
  PastResidentLoggedOut,
} from '../screens';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { withCondition } from '../helpers/typography';
import { isAndroid, isMobileApp } from '../config';
import { colors } from '../constants/colors';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    drawerContent: {
      backgroundColor: themeColors.surface,
    },
    initialRenderStyle: {
      position: 'relative',
      display: 'none',
    },
  });
  return styles;
};

const Drawer = createDrawerNavigator();

// horrible hack, but so far it is the only one working consistently
// basically during initial render the sidebar is shown opened with
// this hack he keep track of the initial render and show it as hidden
// we don't use state as before because using state was forcing a new
// render which in time was briefly showing the sidebar, hence basically
// producing the initial issue anyway
//
// https://github.com/react-navigation/react-navigation/issues/7515
// let initialRender = true;
// We will need to enable this hack again with SDK

const AppStack = (): JSX.Element => {
  const { colors: themeColors } = useAppTheme();

  const styles = createStyles(themeColors);

  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    setTimeout(() => setInitialRender(false), 10);
  }, [initialRender]);

  return (
    <Drawer.Navigator
      drawerContentOptions={{ style: styles.drawerContent }}
      drawerStyle={initialRender ? styles.initialRenderStyle : null}
      drawerContent={props => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeNavigator} />
      <Drawer.Screen name="Messages" component={Messages} />
      <Drawer.Screen name="Payments" component={PaymentNavigator} />
      <Drawer.Screen name="Maintenance" component={MaintenanceNavigator} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="About" component={About} />
      <Stack.Screen
        name="Acknowledgements"
        component={Acknowledgements}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Drawer.Screen name="RegistrationCompleted" component={RegistrationCompleted} />
      <Stack.Screen
        name="DeclinedTransactionInfo"
        component={DeclinedTransactionInfo}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Drawer.Screen name="ComponentsDemo" component={ComponentsDemo} />
    </Drawer.Navigator>
  );
};

const AuthStack = (): JSX.Element => {
  const { colors: themeColors, dark } = useAppTheme();
  const { settings } = useStores();

  // Warning: Not add hooks inside the AuthAppBar could generate errors
  const AuthAppBar = ({ previous, navigation }: StackHeaderProps) => {
    const styles = StyleSheet.create({
      header: {
        elevation: 0,
        ...withCondition(isMobileApp, { backgroundColor: colors.transparent }),
      },
    });
    return (
      <Appbar.Header theme={{ colors: { primary: themeColors.background } }} style={styles.header}>
        <StatusBar
          barStyle={dark ? 'light-content' : 'dark-content'}
          hidden={!isAndroid}
          backgroundColor={themeColors.background}
          translucent
        />
        {previous && <Appbar.BackAction onPress={() => navigation.goBack()} color={themeColors.primary} />}
      </Appbar.Header>
    );
  };

  const getInitialAuthRouteName = () => {
    const { isEmailTokenExpired, emailToken } = settings;
    // TODO: when will this happen? the validity of the token should be caught at the
    // deepLink endpoint so we should never reach this url. Should we?
    if (isEmailTokenExpired) return 'InvitationLinkExpired';

    // TODO: not sure this should be calculated here.
    // Is this redirection keeping the query params? I have the feeling it is just eating them
    // It seems it is working because at the App.tsx we check for the params and store them
    // into the mobx stores, but we need to be sure this is the behavior we want
    // It took me a lot to find why the forceLogout parameter was removed and it seemed to be
    // because of this code deciding to load the signIn route without params
    if (emailToken) return 'SignInPassword';
    return 'SignIn';
  };

  const initialRouteName = getInitialAuthRouteName();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      mode="card"
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        header: AuthAppBar,
        ...withCondition(isMobileApp, { headerTransparent: true }),
      }}
    >
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignInPassword" component={SignInPassword} />
      <Stack.Screen name="FirstTimeUser" component={FirstTimeUser} />
      <Stack.Screen name="ResetLinkSent" component={ResetLinkSent} />
      <Stack.Screen name="CreatePassword" component={CreatePassword} />
      <Stack.Screen name="InvitationLinkExpired" component={InvitationLinkExpired} />
      <Stack.Screen name="ResetLinkExpired" component={ResetLinkExpired} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="PastResidentLoggedOut" component={PastResidentLoggedOut} />
    </Stack.Navigator>
  );
};

const NotificationStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="UnsubscribeLink" component={UnsubscribeComms} />
    </Stack.Navigator>
  );
};

const PublicStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PostPreview" component={PostPreview} />
    </Stack.Navigator>
  );
};

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { auth } = useStores();
  return useObserver(() => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {auth.isSignedIn ? (
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        )}
        <Stack.Screen name="Notification" component={NotificationStack} />
        <Stack.Screen name="Public" component={PublicStack} />
      </Stack.Navigator>
    );
  });
};
