import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Divider, Button } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import { PaymentInfo, AmountType, PaymentMethod } from '../mobx/stores/paymentTypes';
import { t } from '../i18n/trans';
import { Screen, Text, Caption, BalanceInfo } from '../components';
import { useStores } from '../mobx/useStores';
import { PaymentsScreenNavigationProp } from '../types';
import {
  getBalance,
  formatAsCurrency,
  getPaymentMethodText,
  getPaymentFeeValue,
  MAXIMUM_ALLOWED_PAYMENT,
} from '../helpers/payments';
import { Lock } from '../helpers/icons';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      flex: 1,
      alignItems: 'flex-start',
      padding: 16,
    },
    divider: {
      width: '100%',
      marginVertical: 6,
    },
    summaryRowHeader: {
      marginVertical: 16,
    },
    summaryRow: {
      marginVertical: 8,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    confirmPaymentContainer: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 18,
      alignItems: 'center',
    },
    secureInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    confirmPaymentButton: {
      width: '100%',
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
  });

  return styles;
};

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const ReviewPayment = ({ navigation }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);
    const { payment } = useStores();
    const {
      amountType,
      fixedAmount,
      setShouldResetAmountFlag,
      selectedUnitPayment,
      selectedPaymentMethod = {} as PaymentMethod,
    } = payment;
    const unitPayment = selectedUnitPayment as PaymentInfo;

    const { balance } = getBalance(unitPayment);
    const balanceExceedsCapLimit = balance > MAXIMUM_ALLOWED_PAYMENT;
    const payableBalance = balanceExceedsCapLimit ? MAXIMUM_ALLOWED_PAYMENT : balance;
    const amount = amountType === AmountType.Fixed ? fixedAmount : payableBalance;
    const fees = getPaymentFeeValue(selectedPaymentMethod, amount);
    const total = amount + fees;

    const handleClose = () => {
      setShouldResetAmountFlag(false);
    };

    return (
      <Screen
        title={t('CONFIRM_PAYMENT')}
        navigation={navigation}
        mode="detail"
        onClose={handleClose}
        contentInSafeView
      >
        <ScrollView contentContainerStyle={styles.content}>
          <BalanceInfo />
          <View style={[styles.summaryRow, styles.summaryRowHeader]}>
            <Text fontWeight="bold">{t('SUMMARY')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>{t('PAYMENT_METHOD')}</Text>
            <Text>
              {selectedPaymentMethod &&
                `${getPaymentMethodText(selectedPaymentMethod.channelType)} #${selectedPaymentMethod.lastFour}`}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text>{t('PAYMENT_AMOUNT')}</Text>
            <Text>{formatAsCurrency(amount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>{t('ADDITIONAL_FEES')}</Text>
            <Text>{formatAsCurrency(fees)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text fontWeight="medium">{t('TOTAL').toUpperCase()}</Text>
            <Text fontWeight="medium">{formatAsCurrency(total)}</Text>
          </View>
        </ScrollView>
        <View style={styles.confirmPaymentContainer}>
          <View style={styles.secureInfoContainer}>
            <Lock fill={themeColors.placeholder} width={12} height={12} />
            <Caption>{t('THIS_IS_A_SECURE_PAYMENT')}</Caption>
          </View>
          <Button
            mode="contained"
            style={styles.confirmPaymentButton}
            labelStyle={styles.buttonLabel}
            disabled={!selectedPaymentMethod}
            onPress={() => {
              payment.createPayment(amount);
              navigation.navigate('ProcessingPayment');
            }}
          >
            {t('CONFIRM_PAYMENT')}
          </Button>
        </View>
      </Screen>
    );
  });
