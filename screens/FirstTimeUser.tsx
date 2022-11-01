import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useStores } from '../mobx/useStores';
import { FirstTimeUserScreenNavigationProp } from '../types';
import { ContentWrapper } from '../components';
import { t } from '../i18n/trans';
import { AppBranding } from '../components/AppBranding';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

interface Styles {
  message: TextStyle;
  buttonLabel: TextStyle;
  button: ViewStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    message: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      letterSpacing: 0.1,
    },
    button: {
      minWidth: 142,
      marginVertical: 24,
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  navigation: FirstTimeUserScreenNavigationProp;
}

export const FirstTimeUser = ({ navigation }: Props): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const { settings } = useStores();
  const message = t('FIRST_TIME_USER_MESSAGE', { appName: settings.applicationName });

  return (
    <ContentWrapper isAuthScreenContainer>
      <AppBranding />
      <Text style={styles.message}>{message}</Text>
      <Button
        onPress={() => navigation.navigate('SignIn', {})}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        mode="contained"
      >
        {t('GOT_IT')}
      </Button>
    </ContentWrapper>
  );
};
