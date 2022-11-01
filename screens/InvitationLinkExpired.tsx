import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { Title, Text } from 'react-native-paper';
import { t } from '../i18n/trans';

import { ContentWrapper } from '../components';
import { AppBranding } from '../components/AppBranding';

interface Styles {
  title: TextStyle;
  message: TextStyle;
}

const createStyles = () => {
  const baseStyles: Styles = {
    title: {
      textAlign: 'center',
      marginBottom: 24,
    },
    message: {
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 24,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const InvitationLinkExpired = (): JSX.Element => {
  const styles = createStyles();

  return (
    <ContentWrapper isAuthScreenContainer>
      <AppBranding />
      <Title style={styles.title}>{t('SORRY_INVITATION_HAS_EXPIRED')}</Title>
      <Text style={styles.message}>{t('INVITATION_HAS_EXPIRED_INSTRUCTIONS')}</Text>
    </ContentWrapper>
  );
};
