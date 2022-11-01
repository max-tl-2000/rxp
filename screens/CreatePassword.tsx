import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, TextStyle, TouchableWithoutFeedback } from 'react-native';
import { useObserver } from 'mobx-react-lite';
import { Button, Caption } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { AppBranding } from '../components/AppBranding';
import { useStores } from '../mobx/useStores';
import { TextInput, ContentWrapper, Text, WebWordBreakWrapper } from '../components';
import { t } from '../i18n/trans';
import { ThemeColors } from '../helpers/theme';
import { isWeb } from '../config';
import { isMobileBrowser } from '../helpers/is-mobile';
import { openLinkHandler } from '../helpers/openLinkHandler';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  button: ViewStyle;
  buttonLabel: TextStyle;
  invitedUserNameView: ViewStyle;
  link: TextStyle;
  textCenter: TextStyle;
  footerContainer: ViewStyle;
  row: ViewStyle;
  fontSize13: TextStyle;
  invitedUserNameStyle: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    footerContainer: {
      alignItems: 'center',
      marginTop: 24,
    },
    button: {
      minWidth: 142,
      marginTop: 12,
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
    invitedUserNameView: {
      width: 256,
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    link: {
      color: themeColors.accent,
    },
    textCenter: {
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
    },
    fontSize13: {
      fontSize: 13,
    },
    invitedUserNameStyle: {
      marginVertical: 0,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const CreatePassword = (): JSX.Element =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

    const { auth, settings } = useStores();

    const { signUpForm: form } = auth;

    const onCreateAccount = async () => {
      await form.validate();

      if (form.valid) {
        const { email, password, _name_ } = form.serializedData;

        await auth.signUp(email, password, _name_);

        if (isWeb) {
          if (!isMobileBrowser()) {
            return;
          }

          const THRESHOLD_TO_SHOW_REGISTRATION_COMPLETE = 500;

          setTimeout(() => {
            // attempt to open the app is only needed if we're on the web
            // otherwise we should not attempt to do this
            Linking.openURL(auth.getDeepLinkUrl('/app/registrationCompleted', true));
          }, THRESHOLD_TO_SHOW_REGISTRATION_COMPLETE);
        }
      }
    };

    const renderFooter = () => {
      const { legal } = settings;
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.fontSize13}>{t('CREATE_ACCOUNT_AGREEMENTS')}</Text>
          <View style={styles.row}>
            <TouchableWithoutFeedback onPress={async () => openLinkHandler(legal?.termsOfServiceUrl)}>
              <Text style={[styles.link, styles.fontSize13]}>{t('TERMS_OF_SERVICE')}</Text>
            </TouchableWithoutFeedback>
            <Text style={styles.fontSize13}>{` ${t('AND')} `}</Text>
            <TouchableWithoutFeedback onPress={async () => openLinkHandler(legal?.privacyPolicyUrl)}>
              <Text style={[styles.link, styles.fontSize13]}>{t('PRIVACY_POLICY')}</Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    };

    const { fields } = form;
    const { email, password, _name_ } = fields || {};

    useEffect(() => {
      if (!email?.value && settings.tokenEmail) {
        fields.email.setValue(settings.tokenEmail);
      }
    }, [settings.tokenEmail]);

    return (
      <ContentWrapper isAuthScreenContainer>
        <AppBranding />
        <View style={styles.invitedUserNameView}>
          <Caption style={styles.invitedUserNameStyle}>{t('INVITED_USER_NAME')}</Caption>
          <WebWordBreakWrapper>
            <Text>{email?.value}</Text>
          </WebWordBreakWrapper>
        </View>
        <TextInput
          isPassword
          value={password?.value}
          onChangeText={val => password.setValue(val)}
          onSubmitEditing={onCreateAccount}
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
          maxLength={254}
          errorVisible={password.blurred && !!password.errorMessage}
          errorMessage={t(password.errorMessage as string)}
        />
        <TextInput value={_name_.value} placeholder="_name_" isNotVisible />
        <Button
          onPress={onCreateAccount}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          mode="contained"
          loading={auth?.signInInProgress}
          disabled={auth?.signInInProgress}
        >
          {auth.signInInProgress ? t('CREATE_ACCOUNT_IN_PROGRESS') : t('CREATE_ACCOUNT')}
        </Button>
        {renderFooter()}
      </ContentWrapper>
    );
  });
