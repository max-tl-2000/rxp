import React, { useState, useEffect, ComponentType } from 'react';
import { StyleSheet, StatusBar, Image, LayoutAnimation, View, NativeModules, Platform } from 'react-native';
import { Appbar, Menu } from 'react-native-paper';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { sizes } from '../constants/sizes';
import { useAppTheme } from '../hooks/use-app-theme';
import { isWeb, isAndroid } from '../config';
import { injectStyles } from '../helpers/inject-styles';
import { RevaBugLightBw, RevaBugDarkBw } from '../helpers/icons';
import { ThemeColors } from '../helpers/theme';

const appBarHeight = (isLandscape?: boolean) =>
  Platform.select({
    ios: (isLandscape ? 0 : Constants.statusBarHeight) + sizes.appBar.height,
    default: sizes.appBar.height,
  });
const getHeight = (isLandscape?: boolean) => appBarHeight(isLandscape) + sizes.appBar.marginBottom;

const createStyles = (themeColors: ThemeColors, isLandscape?: boolean) => {
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: getHeight(isLandscape),
      overflow: 'hidden',
      zIndex: sizes.appBar.zIndex,
    },
    appBar: {
      height: appBarHeight(isLandscape),
      paddingTop: Platform.select({ ios: isLandscape ? 0 : Constants.statusBarHeight, default: 0 }),
      backgroundColor: themeColors.appBarPrimary,
      elevation: 6,
    },
    content: {
      alignItems: 'flex-start',
    },
    title: {
      color: themeColors.text,
    },
    propertyImage: {
      height: 40,
      width: 40,
      left: 15,
    },
  });
  return styles;
};

export type MenuItemsProps = { navigation: any; closeOverflowMenu?: Function };

interface Props {
  icon: string;
  title: string;
  action: any;
  hidden?: boolean;
  propertyLogoUri?: string;
  renderAppLogo?: boolean;
  menuItems?: ComponentType<MenuItemsProps>;
  isLandscape: boolean;
}

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export const AppBar = ({
  icon,
  title,
  action,
  hidden = false,
  menuItems: MenuItems,
  propertyLogoUri,
  renderAppLogo,
  isLandscape,
}: Props): JSX.Element => {
  const { dark, colors: themeColors } = useAppTheme();

  const navigation = useNavigation();

  const styles = createStyles(themeColors, isLandscape);

  const [viewHeight, setViewHeight] = useState(getHeight(isLandscape));

  const [overflowMenuVisible, setOverflowMenuVisible] = useState(false);

  const openOverflowMenu = () => setOverflowMenuVisible(true);

  const closeOverflowMenu = () => setOverflowMenuVisible(false);

  const iconColor = icon === 'blank' ? 'transparent' : themeColors.text;

  const getAppbarIcon = () => {
    if (icon === 'blank' && propertyLogoUri) {
      return <Image style={styles.propertyImage} source={{ uri: propertyLogoUri }} />;
    }

    return <Appbar.Action icon={icon} onPress={action} color={iconColor} />;
  };

  const getAppLogo = () => {
    if (!dark) return <RevaBugDarkBw width={30} height={30} />;

    return <RevaBugLightBw width={30} height={30} />;
  };

  const menuItemsOffset = isWeb ? sizes.appBar.height : appBarHeight(isLandscape) - Constants.statusBarHeight;

  useEffect(() => {
    LayoutAnimation.easeInEaseOut();
    setViewHeight(hidden ? 0 : getHeight(isLandscape));
  }, [hidden]);

  if (isWeb)
    injectStyles({
      id: 'appBarContainer',
      styles: `
    #appBarContainer {
      z-index: ${sizes.appBar.zIndex};
    }`,
    });

  return (
    <View style={{ ...styles.container, height: viewHeight }} nativeID="appBarContainer">
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        animated
        backgroundColor={themeColors.appBarPrimary}
        hidden={hidden && !isAndroid}
      />
      <Appbar style={styles.appBar}>
        {getAppbarIcon()}
        {renderAppLogo && getAppLogo()}
        <Appbar.Content titleStyle={styles.title} style={styles.content} title={title} />
        {MenuItems && (
          <Menu
            visible={overflowMenuVisible}
            onDismiss={closeOverflowMenu}
            contentStyle={{ marginTop: menuItemsOffset }}
            anchor={<Appbar.Action icon="dots-vertical" onPress={openOverflowMenu} color={themeColors.text} />}
          >
            <MenuItems closeOverflowMenu={closeOverflowMenu} navigation={navigation} />
          </Menu>
        )}
      </Appbar>
    </View>
  );
};
