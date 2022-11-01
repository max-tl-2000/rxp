import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { reaction } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { Button, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { AppBranding } from '../components/AppBranding';
import { useStores } from '../mobx/useStores';
import { FAILED_TO_FETCH } from '../constants/messages';
import { ThemeColors } from '../helpers/theme';
import { SignInPasswordScreenNavigationProp } from '../types';
import { t } from '../i18n/trans';

import { TextInput, ContentWrapper, HelperTextWithLink, WebWordBreakWrapper } from '../components';
import { useAppTheme } from '../hooks/use-app-theme';
import { LoginStatus } from '../mobx/stores/authTypes';

interface Styles {
  button: ViewStyle;
  buttonLabel: TextStyle;
  errorMessage: TextStyle;
  errorMessageContainer: ViewStyle;
  marginBottomView: ViewStyle;
  textCenter: TextStyle;
  emailViewContainer: ViewStyle;
  emailFontSize: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    button: {
      minWidth: 142,
      marginTop: 12,
      marginBottom: 24,
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
    errorMessage: {
      color: themeColors.error,
    },
    errorMessageContainer: {
      marginBottom: 24,
    },
    marginBottomView: {
      marginBottom: 24,
    },
    textCenter: {
      textAlign: 'center',
    },
    emailViewContainer: {
      width: 256,
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    emailFontSize: {
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '500',
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  navigation: SignInPasswordScreenNavigationProp;
}

export const SignInPassword = ({ navigation }: Props): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const { auth } = useStores();

  const { signInForm: form } = auth;

  reaction(
    () => auth.status,
    status => {
      if (status === LoginStatus.userIsPastResident) {
        navigation.replace('PastResidentLoggedOut', {});
      }
    },
  );

  useEffect(() => {
    if (!form.fields.email.value) {
      // why not navigate('SignIn', {});
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => auth.resetStatus();
    }, []),
  );

  const onSignIn = async () => {
    await form.validate();

    if (form.valid) {
      const { email, password, _name_ } = form.serializedData;
      await auth.signIn(email, password, _name_);
    }
  };

  const { email, password, _name_ } = form.fields;

  const onPressForgotPasswordLink = async () => {
    if (auth.resetPasswordInProgress) return;
    await auth.sendResetPasswordEmail({ email: email.value, _name_: _name_.value });
    navigation.navigate('ResetLinkSent', {});
  };

  const renderErrorBlock = () => {
    const WrongPasswordMessage = t('WRONG_PASSWORD_MESSAGE');
    const AccountBlockedMessage = t('BLOCKED_ACCOUNT_MESSAGE');

    if (auth.loginStateWrongPassword) {
      return (
        <View style={styles.errorMessageContainer}>
          <Text style={[styles.errorMessage, styles.textCenter]}>{WrongPasswordMessage}</Text>
        </View>
      );
    }

    if (auth.loginStateAccountBlocked) {
      return (
        <View style={styles.errorMessageContainer}>
          <Text style={[styles.errorMessage, styles.textCenter, styles.marginBottomView]}>{AccountBlockedMessage}</Text>
        </View>
      );
    }

    if (auth.userSignInObservablePromise?.promiseError?.message === FAILED_TO_FETCH) return '';
    return (
      <View style={styles.errorMessageContainer}>
        <Text style={[styles.errorMessage, styles.textCenter, styles.marginBottomView]}>
          {t('GENERIC_ERROR_MESSAGE')}
        </Text>
      </View>
    );
  };

  // TODO: We need proper loading states for the actions that take a lot of time
  // like the process to send a reset link from the app

  return (
    <ContentWrapper isAuthScreenContainer>
      <AppBranding />
      <Observer>
        {() => (
          <>
            {auth.loginError && renderErrorBlock()}
            <View style={styles.emailViewContainer}>
              <WebWordBreakWrapper>
                <Text style={styles.emailFontSize}>{email?.value}</Text>
              </WebWordBreakWrapper>
            </View>
            {!auth.loginStateAccountBlocked && (
              <>
                <TextInput
                  isPassword
                  autoFocus
                  value={password.value}
                  onChangeText={value => {
                    password.setValue(value);
                    auth.clearStatus();
                  }}
                  onSubmitEditing={onSignIn}
                  onBlur={() => password.markBlurredAndValidate()}
                  placeholder={t('PASSWORD')}
                  autoCompleteType="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  blurOnSubmit
                  returnKeyType="done"
                  textContentType="password"
                  enablesReturnKeyAutomatically
                  disableFullscreenUI
                  disabled={auth.loginInProgressOrLoginSuccess || auth.resetPasswordInProgress}
                  maxLength={254}
                  errorVisible={password.blurred && !!password.errorMessage}
                  errorMessage={t(password.errorMessage as string)}
                />
                <TextInput value={_name_.value} placeholder="_name_" isNotVisible />
              </>
            )}
          </>
        )}
      </Observer>

      <Observer>
        {() => (
          <>
            {!auth.loginStateAccountBlocked && (
              <Button
                onPress={onSignIn}
                style={[styles.button, styles.marginBottomView]}
                labelStyle={styles.buttonLabel}
                mode="contained"
                loading={auth.loginInProgressOrLoginSuccess || auth.resetPasswordInProgress}
                disabled={auth.loginInProgressOrLoginSuccess || auth.resetPasswordInProgress}
              >
                {auth.loginInProgressOrLoginSuccess ? t('SIGNING_IN_PROGRESS') : t('SIGN_IN')}
              </Button>
            )}
            <HelperTextWithLink
              helperText={t('FORGOT_YOU_PASSWORD_HELPER')}
              linkText={t('FORGOT_YOU_PASSWORD_LINK')}
              onPress={onPressForgotPasswordLink}
            />
          </>
        )}
      </Observer>
    </ContentWrapper>
  );
};
