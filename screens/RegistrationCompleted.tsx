import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Observer } from 'mobx-react-lite';
import { Button, Text } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { useStores } from '../mobx/useStores';
import { RegistrationCompletedScreenNavigationProp } from '../types';
import { ContentWrapper } from '../components';
import { t } from '../i18n/trans';
import { AppBranding } from '../components/AppBranding';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

interface Styles {
  button: ViewStyle;
  buttonLabel: TextStyle;
  congratsText: TextStyle;
  startUsingAppText: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    button: {
      minWidth: 153,
      marginTop: 75,
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
    congratsText: {
      fontSize: 13,
    },
    startUsingAppText: {
      fontSize: 13,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  navigation: RegistrationCompletedScreenNavigationProp;
}

export const RegistrationCompleted = ({ navigation }: Props): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const { settings } = useStores();

  useEffect(() => {
    if (!settings.getAppUrl) {
      navigation.navigate('App', { screen: 'Home' });
    }
  }, []);

  return (
    <ContentWrapper>
      <AppBranding />

      <Text style={styles.congratsText}>{t('ACCOUNT_CREATED_MESSAGE')}</Text>
      <Text style={styles.startUsingAppText}>{t('START_USING_APP_MESSAGE', { appName: settings.appName })}</Text>

      <Observer>
        {() => (
          <Button
            onPress={() => Linking.openURL(settings.getAppUrl)}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            mode="contained"
          >
            {t('TAKE_ME_THERE')}
          </Button>
        )}
      </Observer>
    </ContentWrapper>
  );
};
