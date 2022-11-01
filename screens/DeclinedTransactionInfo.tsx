import React from 'react';
import { View, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import { t } from '../i18n/trans';
import { PaymentsScreenNavigationProp } from '../types';
import { Screen, Text } from '../components';
import { useStores } from '../mobx/useStores';
import { PaymentInfo } from '../mobx/stores/paymentTypes';
import { getBalance } from '../helpers/payments';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

interface Styles {
  container: ViewStyle;
  text: TextStyle;
  button: ViewStyle;
  buttonLabel: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    container: {
      margin: 16,
    },
    text: {
      lineHeight: 20,
      letterSpacing: 0.14,
    },
    button: {
      minWidth: 240,
      alignItems: 'flex-start',
      marginTop: 16,
      marginBottom: 24,
    },
    buttonLabel: {
      textAlign: 'left',
      marginHorizontal: 0,
      color: themeColors.secondary,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const DeclinedTransactionInfo = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment: paymentsStore } = useStores();
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

    const unitPayment = paymentsStore.selectedUnitPayment as PaymentInfo;
    const { balance } = getBalance(unitPayment);

    const payNowTarget = balance ? 'MakePayment' : 'UnitPayments';

    return (
      <Screen
        title={t('PAYMENTS_UNIT', { unitName: paymentsStore.selectedUnitPayment?.unitUserInfo.unitDisplayName })}
        mode="modal"
        navigation={navigation}
      >
        <View style={styles.container}>
          <Text style={styles.text} fontWeight="bold">
            {t('SETTLE_YOUR_BALANCE')}
          </Text>
          <Text style={styles.text}>{t('MAKE_ONE_TIME_PAYMENT_FOR_DECLINED_SCHEDULED')}</Text>
          <Button
            style={styles.button}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('Payments', { screen: 'Main', params: { screen: payNowTarget } })}
          >
            {t('PAY_NOW')}
          </Button>
          <Text style={styles.text} fontWeight="bold">
            {t('REVIEW_SCHEDULED_PAYMENTS')}
          </Text>
          <Text style={styles.text}>{t('REVIEW_SCHEDULED_PAYMENTS_RECOMMENDATION')}</Text>
          <Button
            style={styles.button}
            labelStyle={styles.buttonLabel}
            onPress={() => {
              navigation.navigate('Payments', { screen: 'Main', params: { screen: 'ManageScheduledPayments' } });
            }}
          >
            {t('SHOW_SCHEDULED_PAYMENTS')}
          </Button>
          <Text style={styles.text} fontStyle="italic">
            {t('REVISIT_INFO')}
          </Text>
        </View>
      </Screen>
    );
  });
