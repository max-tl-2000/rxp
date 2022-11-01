import React, { ComponentType } from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  KeyboardAvoidingView,
  ViewStyle,
  Platform,
  SafeAreaView,
} from 'react-native';
import merge from 'lodash/merge';
import { useObserver } from 'mobx-react-lite';
import { useRoute } from '@react-navigation/native';

import { useStores } from '../mobx/useStores';
import { ThemeColors } from '../helpers/theme';
import { AppBar, MenuItemsProps } from './AppBar';
import { sizes } from '../constants/sizes';
import { isWeb } from '../config';
import { useAppTheme } from '../hooks/use-app-theme';
import { withCondition } from '../helpers/typography';
import { Banner } from './Banner';
import { SplashScreen } from './SplashScreen';
import { Snackbar } from './Snackbar';

interface Styles {
  screen: ViewStyle;
  contentContainer: ViewStyle;
  unsubscribeContentContainer: ViewStyle;
  touchable: ViewStyle;
  bgDefault: ViewStyle;
}

const createStyles = (
  themeColors: ThemeColors,
  isWideScreen: boolean,
  useTwoToneBackground: boolean,
  addPadding: boolean,
  isLandscape: boolean,
) => {
  const baseStyles: Styles = {
    screen: {
      flex: 1,
      backgroundColor: useTwoToneBackground ? themeColors.surfaceSecondary : themeColors.background,
    },
    contentContainer: {
      marginTop: -sizes.appBar.marginBottom,
      flex: 1,
      width: '100%',
      paddingHorizontal: isLandscape ? sizes.appBar.marginBottom + 10 : undefined,
    },
    unsubscribeContentContainer: {
      marginTop: Platform.select({ web: 0, default: -sizes.appBar.marginBottom }),
      flex: 1,
      width: '100%',
    },
    touchable: {
      flex: 1,
    },
    bgDefault: {
      backgroundColor: themeColors.background,
    },
  };

  const wideScreenStyles: Partial<Styles> = {
    contentContainer: {
      minWidth: 380,
      maxWidth: 634,
      alignSelf: 'center',
      paddingHorizontal: useTwoToneBackground && addPadding ? 91 : undefined,
    },
    unsubscribeContentContainer: {
      minWidth: 380,
      maxWidth: 800,
      alignSelf: 'center',
    },
  };

  return StyleSheet.create(merge(baseStyles, isWideScreen && wideScreenStyles));
};

export type ScreenModes = 'screen' | 'detail' | 'modal' | 'no-action';

interface ScreenProps {
  title: string;
  navigation?: any;
  children: React.ReactNode | React.ReactNode[];
  hasInputs?: boolean;
  contentContainerStyle?: ViewStyle;
  contentInSafeView?: boolean;
  hideAppBar?: boolean;
  useTwoToneBackground?: boolean;
  mode?: ScreenModes;
  menuItems?: ComponentType<MenuItemsProps>;
  onClose?: Function;
  propertyLogoUri?: string;
  renderAppLogo?: boolean;
  unsubscribeScreen?: boolean;
  addPadding?: boolean;
  backScreen?: string;
}

const getAppBarIconAndAction = (mode: ScreenModes, navigation: any, onClose?: Function, backScreen?: string) => {
  switch (mode) {
    case 'detail':
      return {
        appBarIcon: 'chevron-left',
        appBarAction: () => {
          onClose && onClose();
          if (backScreen) navigation.navigate(backScreen);
          else navigation.goBack();
        },
      };
    case 'modal':
      return {
        appBarIcon: 'close',
        appBarAction: () => {
          onClose && onClose();
          if (backScreen) navigation.navigate(backScreen);
          else navigation.goBack();
        },
      };
    case 'no-action':
      return {
        appBarIcon: 'blank',
        appBarAction: null,
      };
    default:
      return {
        appBarIcon: 'menu',
        appBarAction: navigation.openDrawer,
      };
  }
};

export const Screen = ({
  title,
  navigation,
  children = [],
  hasInputs = false,
  contentContainerStyle = {},
  contentInSafeView = false,
  hideAppBar = false,
  useTwoToneBackground = true,
  mode = 'screen',
  backScreen,
  menuItems,
  onClose,
  propertyLogoUri,
  renderAppLogo,
  unsubscribeScreen,
  addPadding = true,
}: ScreenProps) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const { screenSize, notification } = useStores();

    const styles = createStyles(
      themeColors,
      screenSize.matchMedium,
      useTwoToneBackground,
      addPadding,
      screenSize.isLandscape,
    );

    const Content = contentInSafeView && !isWeb ? SafeAreaView : View;

    const { appBarIcon, appBarAction } = getAppBarIconAndAction(mode, navigation, onClose, backScreen);

    const getInteractiveMessageColor = () => {
      const severity = notification.interactiveMessage?.severity;
      if (severity === 'error') return themeColors.error;
      if (severity === 'warning') return themeColors.accent;
      return themeColors.text;
    };

    const currentRoute = useRoute();

    if (notification.shouldShowSplashScreen) return <SplashScreen showActivityIndicator />;

    const renderContent = () => (
      <>
        <AppBar
          renderAppLogo={renderAppLogo}
          propertyLogoUri={propertyLogoUri}
          icon={appBarIcon}
          title={title}
          action={appBarAction}
          hidden={hideAppBar && !isWeb}
          menuItems={menuItems}
          isLandscape={screenSize.isLandscape}
        />

        <Content
          style={
            unsubscribeScreen
              ? [styles.unsubscribeContentContainer]
              : [styles.contentContainer, contentContainerStyle, withCondition(useTwoToneBackground, styles.bgDefault)]
          }
        >
          <Banner
            visible={
              !!notification.interactiveMessage &&
              notification.shouldShowInteractiveMessageOnCurrentScreen(currentRoute.name)
            }
            actions={(notification.interactiveMessage?.actions || []).map(({ label, action }) => ({
              label,
              onPress: () => {
                const { navigationRoute, shouldDismiss } = action();
                if (navigationRoute) navigation.navigate(navigationRoute);
                if (shouldDismiss) notification.dismissInteractiveMessage();
              },
            }))}
            textStyle={{ color: getInteractiveMessageColor() }}
          >
            {notification.interactiveMessage?.text || ''}
          </Banner>
          {children}
        </Content>
        <Snackbar />
      </>
    );

    const renderViewContainer = () => <View style={styles.screen}>{renderContent()}</View>;

    const renderKeyboardAwareContainer = () => (
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: 'padding' })}>
        <TouchableWithoutFeedback style={styles.touchable} onPress={Keyboard.dismiss} accessible={false}>
          {renderContent()}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
    return !hasInputs ? renderViewContainer() : renderKeyboardAwareContainer();
  });
