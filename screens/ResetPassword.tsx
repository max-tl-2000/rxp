import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { useObserver } from 'mobx-react-lite';
import { Button } from 'react-native-paper';
import { Title, Text } from '../components/Typography';
import { useStores } from '../mobx/useStores';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

import { TextInput, ContentWrapper, WebWordBreakWrapper } from '../components';
import { t } from '../i18n/trans';

interface Styles {
  button: ViewStyle;
  buttonStyle: TextStyle;
  emailContainerView: ViewStyle;
  message: TextStyle;
  passwordFieldContainer: TextStyle;
  emailStyle: TextStyle;
  groupView: ViewStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    button: {
      minWidth: 180,
      marginTop: 12,
    },
    buttonStyle: {
      color: themeColors.onPrimary,
    },
    emailContainerView: {
      marginTop: 32,
      marginBottom: 4,
    },
    message: {
      fontWeight: '500',
      lineHeight: 28,
      marginVertical: 0,
    },
    passwordFieldContainer: {
      maxWidth: 279,
    },
    emailStyle: {
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '500',
    },
    groupView: {
      alignItems: 'flex-start',
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const ResetPassword = (): JSX.Element =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

    const { auth, settings } = useStores();
    const { signInForm: form } = auth;
    const { fields } = form;
    const { password, _name_, email: emailField } = fields || {};

    const onResetPassword = async () => {
      await form.validate();

      if (form.valid) {
        const { email, password: newPassword, _name_: honeypotField } = form.serializedData;

        await auth.resetPassword(email, newPassword, honeypotField);
      }
    };

    useEffect(() => {
      if (!emailField?.value && settings.tokenEmail) {
        fields.email.setValue(settings.tokenEmail);
      }
    }, [settings.tokenEmail]);

    return (
      <ContentWrapper shouldJustifyContentTopWithLargeStyle isAuthScreenContainer>
        <View style={styles.groupView}>
          <Title style={styles.message}>{t('FINISH_RESET_PASSWORD_MESSAGE')}</Title>
          <View style={styles.emailContainerView}>
            <WebWordBreakWrapper>
              <Text style={styles.emailStyle}>{emailField?.value}</Text>
            </WebWordBreakWrapper>
          </View>
          <TextInput
            isPassword
            autoFocus
            value={password?.value}
            onChangeText={value => {
              password?.setValue(value);
              auth.clearStatus();
            }}
            onSubmitEditing={onResetPassword}
            onBlur={() => password.markBlurredAndValidate()}
            placeholder={t('ENTER_NEW_PASSWORD')}
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
            errorVisible={password?.blurred && !!password?.errorMessage}
            errorMessage={t(password?.errorMessage as string)}
            containerStyle={styles.passwordFieldContainer}
          />

          <TextInput value={_name_.value} placeholder="_name_" isNotVisible />
        </View>

        <Button onPress={onResetPassword} style={styles.button} labelStyle={styles.buttonStyle} mode="contained">
          {t('RESET_PASSWORD')}
        </Button>
      </ContentWrapper>
    );
  });
