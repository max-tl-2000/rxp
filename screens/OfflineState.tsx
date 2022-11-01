import React from 'react';
import { View, StyleSheet, TextStyle, ViewStyle, Dimensions, Keyboard } from 'react-native';
import { Appbar, Title, Headline, Caption, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { useObserver } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';
import { ThemeColors } from '../helpers/theme';
import { t } from '../i18n/trans';
import { useAppTheme } from '../hooks/use-app-theme';

const screenSize = Dimensions.get('screen');

interface Styles {
  container: ViewStyle;
  headerTitle: TextStyle;
  wrapper: ViewStyle;
  headline: TextStyle;
  subheading: TextStyle;
}
const createStyles = (themeColors: ThemeColors, hasInternet: boolean) => {
  const baseStyles: Styles = {
    container: {
      display: hasInternet ? 'none' : 'flex',
      height: screenSize.height,
      width: screenSize.width,
    },
    headerTitle: {
      fontSize: 20,
      lineHeight: 28,
      paddingLeft: 16,
      color: themeColors.onPrimary,
    },
    wrapper: {
      marginTop: 106,
      marginHorizontal: 50,
      alignItems: 'center',
    },
    headline: {
      fontSize: 24,
      color: themeColors.placeholder,
      textAlign: 'center',
      lineHeight: 32,
      marginTop: 17,
      marginBottom: 12,
    },
    subheading: {
      fontSize: 12,
      color: themeColors.placeholder,
      textAlign: 'center',
      lineHeight: 16,
      letterSpacing: 0.02,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const OfflineState = () => {
  const { settings } = useStores();

  return useObserver(() => {
    Keyboard.dismiss();
    const { network } = useStores();

    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors, network.hasInternet as boolean);

    const title = t('OFFLINE_TITLE');
    const subtitle = t('OFFLINE_SUBTITLE');
    return (
      <Surface style={styles.container}>
        <Appbar.Header>
          <Title style={styles.headerTitle}>{settings.loginFlow?.line1 ?? t('LOGINFLOW_LINE_1')}</Title>
        </Appbar.Header>
        <View style={styles.wrapper}>
          <MaterialIcons name="cloud-off" size={64} color={themeColors.disabled} />
          <Headline style={styles.headline}>{title}</Headline>
          <Caption style={styles.subheading}>{subtitle}</Caption>
        </View>
      </Surface>
    );
  });
};
