import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Title } from './Typography';
import { t } from '../i18n/trans';
import { Pictograph } from './Pictograph';

const styles = StyleSheet.create({
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    marginBottom: 120,
  },
  errorText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  noMarginBottom: {
    marginBottom: 0,
  },
});

interface PaymentErrorProps {
  token?: string;
}

export const PaymentErrorComponent = (props: PaymentErrorProps): JSX.Element => {
  const { token } = props;

  if (token === 'USER_IS_NOT_AUTHORIZED') {
    return (
      <View style={styles.errorContent}>
        <Pictograph type="exhausted" />
        <Title>{t('SORRY')}</Title>
        <Title style={styles.errorText}>{t('CANNOT_USE_PAYMENT')}</Title>
        <Text style={[styles.errorText, styles.noMarginBottom]}>{t('NO_PAYMENT_DATA')}</Text>
        <Text style={styles.errorText}>{t('THIS_MAY_HAPPEND')}</Text>
        <Text style={styles.errorText}>{t('RETRY_LATER_OR_CONTACT_PROPERTY_MAINTENANCE')}</Text>
      </View>
    );
  }
  return (
    <View style={styles.errorContent}>
      <Pictograph type="exhausted" />
      <Title>{t('SOMETHING_WENT_WRONG')}</Title>
      <Text style={styles.errorText}>{t('UNABLE_TO_SHOW_PAYMENT_DATA')}</Text>
      <Text style={styles.errorText}>{t('RETRY_OR_CONTACT_PROPERTY')}</Text>
    </View>
  );
};
