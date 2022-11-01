import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useStores } from '../mobx/useStores';
import { ContentWrapper, WebWordBreakWrapper } from '../components';
import { t } from '../i18n/trans';
import { AppBranding } from '../components/AppBranding';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

interface Styles {
  message: TextStyle;
  buttonLabel: TextStyle;
  button: ViewStyle;
  emailStyle: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    message: {
      marginTop: 24,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      letterSpacing: 0.1,
      maxWidth: 268,
    },
    button: {
      minWidth: 142,
      marginVertical: 24,
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
    emailStyle: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const PastResidentLoggedOut = (): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const { settings, auth } = useStores();
  const { signInForm: form } = auth;
  const { email } = form.fields;

  useEffect(() => {
    form.clearEmail();
  }, []);

  const message = t('PAST_RESIDENT_LOGGED_OUT_MSG', { appName: settings.applicationName });

  return (
    <ContentWrapper isAuthScreenContainer>
      <AppBranding />
      <WebWordBreakWrapper>
        <Text style={styles.emailStyle}>{email?.value}</Text>
      </WebWordBreakWrapper>
      <Text style={styles.message}>{message}</Text>
    </ContentWrapper>
  );
};
