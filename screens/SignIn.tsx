import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Observer } from 'mobx-react-lite';
import { Button } from 'react-native-paper';
import { Scope } from 'i18n-js';
import { AppBranding } from '../components/AppBranding';
import { useStores } from '../mobx/useStores';
import { SignInScreenNavigationProp } from '../types';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

import { TextInput, ContentWrapper, HelperTextWithLink } from '../components';
import { t } from '../i18n/trans';

interface Styles {
  title: TextStyle;
  subtitle: TextStyle;
  button: ViewStyle;
  buttonLabel: TextStyle;
  alignItemsCenter: ViewStyle;
  dropdown: ViewStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    alignItemsCenter: {
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      lineHeight: 28,
      textAlign: 'center',
      alignItems: 'center',
    },
    subtitle: {
      lineHeight: 16,
      fontSize: 12,
      textAlign: 'center',
      alignItems: 'center',
    },
    button: {
      minWidth: 142,
      marginBottom: 24,
      marginTop: 12,
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
    dropdown: {
      minWidth: 256,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  navigation: SignInScreenNavigationProp;
}

export const SignIn = ({ navigation }: Props): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const { auth } = useStores();

  const { signInForm: form } = auth;
  const { email } = form.fields;

  const onSignIn = async () => {
    await email.validate({ force: true });
    if (email.valid) {
      auth.clearStatus();
      navigation.navigate('SignInPassword', {});
    }
  };

  return (
    <ContentWrapper isAuthScreenContainer>
      <AppBranding />
      <Observer>
        {() => {
          return (
            <>
              <TextInput
                value={email?.value}
                onChangeText={val => email.setValue(val)}
                onSubmitEditing={onSignIn}
                placeholder={t('ENTER_YOUR_EMAIL')}
                autoCompleteType="email"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                blurOnSubmit
                returnKeyType="done"
                textContentType="emailAddress"
                keyboardType="email-address"
                enablesReturnKeyAutomatically
                disableFullscreenUI
                maxLength={254}
                errorVisible={email.blurred && !!email.errorMessage}
                errorMessage={t(email.errorMessage as Scope)}
              />
            </>
          );
        }}
      </Observer>
      <Observer>
        {() => (
          <Button
            onPress={onSignIn}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            mode="contained"
            loading={auth?.signInInProgress}
            disabled={auth?.signInInProgress}
          >
            {auth.signInInProgress ? t('SIGNING_IN_PROGRESS') : t('CONTINUE')}
          </Button>
        )}
      </Observer>
      <HelperTextWithLink
        helperText={t('NOT_REGISTERED_HELPER')}
        linkText={t('NOT_REGISTERED_LINK')}
        onPress={() => navigation.navigate('FirstTimeUser', {})}
      />
    </ContentWrapper>
  );
};
