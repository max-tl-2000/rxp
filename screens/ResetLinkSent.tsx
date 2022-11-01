import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ResetLinkSentScreenNavigationProp } from '../types';
import { t } from '../i18n/trans';
import { useStores } from '../mobx/useStores';

import { ContentWrapper } from '../components';
import { AppBranding } from '../components/AppBranding';

interface Styles {
  title: TextStyle;
  appName: TextStyle;
  message: TextStyle;
  button: ViewStyle;
  titleContainer: ViewStyle;
}

const createStyles = () => {
  const baseStyles: Styles = {
    title: {
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 20,
    },
    appName: {
      textAlign: 'center',
      marginBottom: 58,
      marginTop: 90,
    },
    message: {
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 24,
      fontWeight: '400',
      maxWidth: 256,
    },
    button: {
      marginBottom: 24,
    },
    titleContainer: {
      marginBottom: 24,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  navigation: ResetLinkSentScreenNavigationProp;
}

export const ResetLinkSent = ({ navigation }: Props): JSX.Element => {
  const styles = createStyles();
  const { auth } = useStores();

  useEffect(() => {
    const email = auth.signInForm.fields.email.value;

    if (!email) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  }, []);

  const email = auth.signInForm.fields.email.value;
  const message = t(`RESET_LINK_SENT_MESSAGE`);

  return (
    <ContentWrapper isAuthScreenContainer>
      <AppBranding />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{email}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </ContentWrapper>
  );
};
