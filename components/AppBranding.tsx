import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Observer } from 'mobx-react-lite';
import { Title, Subheading } from 'react-native-paper';

import { getLogoForApp, LogoInfoType } from '../helpers/branding-helper';
import { useStores } from '../mobx/useStores';
import { Logo } from './Logo';
import { t } from '../i18n/trans';
import { useAppTheme } from '../hooks/use-app-theme';
import { sizes } from '../constants/sizes';

interface Styles {
  alignItemsCenter: ViewStyle;
  loginFlowLine1: TextStyle;
  loginFlowLine2: TextStyle;
  loginFlowLine3: TextStyle;
  appBrandingContainer: ViewStyle;
}

const createStyles = () => {
  const baseStyles: Styles = {
    alignItemsCenter: {
      alignItems: 'center',
    },
    loginFlowLine2: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
      fontWeight: '500',
      marginVertical: 0,
    },
    loginFlowLine3: {
      lineHeight: 20,
      fontSize: 14,
      textAlign: 'center',
      marginVertical: 0,
    },
    loginFlowLine1: {
      marginTop: 0,
      marginBottom: 4,
      fontSize: 20,
      lineHeight: 28,
      textAlign: 'center',
    },
    appBrandingContainer: {
      marginBottom: 32,
      // The marginTop is 32 the value is calculated in case of some chance in appBar height
      marginTop: 94 - sizes.appBar.height,
      alignItems: 'center',
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const AppBranding = () => {
  const { settings, brandingContext } = useStores();
  const { theme } = useAppTheme();

  const styles = createStyles();

  return (
    <View style={styles.alignItemsCenter}>
      <Observer>
        {() => {
          const { hideLogo, line1, line2, line3 } = settings.loginFlow;

          const title1 = line1 ?? t(`LOGINFLOW_LINE_1`);
          const title2 = line2 ?? t('LOGINFLOW_LINE_2');
          const message = line3 ?? t('LOGINFLOW_LINE_3');

          return (
            <View style={styles.appBrandingContainer}>
              {!hideLogo && (
                <Logo source={getLogoForApp({ ...brandingContext.appLogoInfo, theme } as LogoInfoType) as string} />
              )}
              {!!title1 && <Title style={[styles.loginFlowLine1]}>{title1}</Title>}
              {!!title2 && <Title style={styles.loginFlowLine2}>{title2}</Title>}
              {!!message && <Subheading style={styles.loginFlowLine3}>{message}</Subheading>}
            </View>
          );
        }}
      </Observer>
    </View>
  );
};
