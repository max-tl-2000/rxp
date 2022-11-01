import React, { useEffect } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerNavigationProp,
  useIsDrawerOpen,
} from '@react-navigation/drawer';
import { Divider, Avatar } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { getLogoForProperty } from '../helpers/branding-helper';
import { DrawerItem } from './DrawerItem';
import { useStores } from '../mobx/useStores';
import { ThemeColors } from '../helpers/theme';
import { isDevelopmentEnv } from '../config';
import { PropertyMenuList } from '../components';
import { useAppTheme } from '../hooks/use-app-theme';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    hero: {
      backgroundColor: themeColors.navDrawerHeader,
      marginTop: -4 - Constants.statusBarHeight,
      paddingTop: Math.max(Constants.statusBarHeight, 16),
      paddingBottom: 8,
      paddingLeft: 16,
    },
    avatar: {
      backgroundColor: themeColors.navDrawerHeader,
    },
    divider: {
      height: 1,
    },
  });
  return styles;
};

export const DrawerContent = (props: DrawerContentComponentProps): JSX.Element => {
  const { auth, brandingContext, userSettings } = useStores();

  const { theme, colors: themeColors } = useAppTheme();
  const { state: navigationState, navigation } = props;
  const { navigate } = navigation;
  const activeItem = navigationState.routeNames[navigationState.index];

  const styles = createStyles(themeColors);

  const [showPropertyMenu, setShowPropertyMenu] = React.useState(false);
  const handleTogglePropertyMenu = () => {
    setShowPropertyMenu(!showPropertyMenu);
  };

  const wasDrawerOpen = useIsDrawerOpen();

  useEffect(() => {
    return () => {
      !wasDrawerOpen && Keyboard.dismiss();
      if (wasDrawerOpen) {
        setShowPropertyMenu(false);
      }
    };
  }, [wasDrawerOpen]);

  const closeDrawer = () => {
    // there is an issue https://github.com/react-navigation/react-navigation/issues/6592
    // that is why I need to do it this way
    ((navigation as any) as DrawerNavigationProp<{}>).closeDrawer();
  };

  const resetAction = CommonActions.reset({
    key: '',
    index: 0,
    routeNames: ['Home'],
    history: undefined,
    routes: [{ name: 'Home' }],
  });

  const handleItemPress = () => {
    setShowPropertyMenu(false);
    closeDrawer();
    navigation.dispatch(resetAction);
  };

  const OptionsMenu = () =>
    useObserver(() => {
      const { post: postStore, messages: messagesStore, payment: paymentStore } = useStores();
      const { hasUnreadPosts } = postStore;
      const { maintenanceModule = false, paymentModule = false } = userSettings?.propertySelected?.features ?? {};
      const { hasUnreadMessages } = messagesStore;
      const { hasOverduePayments } = paymentStore;

      return (
        <>
          <DrawerItem
            label="Home"
            icon="Home"
            showUnreadContentBadge={activeItem !== 'Home' && hasUnreadPosts}
            isActive={activeItem === 'Home'}
            onPress={() => navigate('Home')}
          />
          <DrawerItem
            label="Messages"
            icon="Chat"
            showUnreadContentBadge={activeItem !== 'Messages' && hasUnreadMessages}
            isActive={activeItem === 'Messages'}
            onPress={() => navigate('Messages')}
          />
          {(paymentModule || maintenanceModule) && <Divider style={styles.divider} />}
          {paymentModule && (
            <DrawerItem
              label="Payments"
              icon="CreditCard"
              showUnreadContentBadge={activeItem !== 'Payments' && hasOverduePayments}
              useAccentColor
              isActive={activeItem === 'Payments'}
              onPress={() => navigate('Payments')}
            />
          )}
          {maintenanceModule && (
            <DrawerItem
              label="Maintenance"
              icon="Wrench"
              isActive={activeItem === 'Maintenance'}
              onPress={() => navigate('Maintenance')}
            />
          )}
          {isDevelopmentEnv && (
            <>
              <Divider style={styles.divider} />
              <DrawerItem
                label="Components Demo"
                icon="HelpCircle"
                isActive={activeItem === 'ComponentsDemo'}
                onPress={() => navigate('ComponentsDemo')}
              />
            </>
          )}
          <Divider style={styles.divider} />
          <DrawerItem
            label="About"
            icon="Information"
            isActive={activeItem === 'About'}
            onPress={() => navigate('About')}
          />
          <Divider style={styles.divider} />
          <DrawerItem
            label="Logout"
            icon="Logout"
            onPress={() => {
              closeDrawer();
              auth.signOut();
            }}
          />
        </>
      );
    });

  const propertyLogo = getLogoForProperty({ ...brandingContext.propertyInfoForLogo, theme });

  // TODO: handle the case image fails to load for the Avatar component below
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.hero}>
        <Avatar.Image style={styles.avatar} size={64} source={{ uri: propertyLogo }} />
      </View>
      <PropertyMenuList
        expanded={showPropertyMenu}
        onTogglePropertyMenu={handleTogglePropertyMenu}
        onItemPress={handleItemPress}
      />
      {!showPropertyMenu && <OptionsMenu />}
    </DrawerContentScrollView>
  );
};
