import React from 'react';
import { StyleSheet, View, ListRenderItemInfo } from 'react-native';
import { Divider } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import { t } from '../i18n/trans';
import { PaymentHistoryScreenNavigationProp } from '../types';
import { useStores } from '../mobx/useStores';
import { PaymentInfo, PaymentTransactionsHistory, PaymentTypes } from '../mobx/stores/paymentTypes';
import { Screen, Text, FlatList, LinearGradient } from '../components';
import { formatAsCurrency, getPaymentMethodText, getUnitName } from '../helpers/payments';
import { toMoment } from '../helpers/moment-utils';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { MONTH_DATE_TIME_FORMAT } from '../constants/date_formats';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      padding: 16,
    },
    row: {
      flexDirection: 'row',
    },
    firstRowText: {
      lineHeight: 20,
      letterSpacing: 0.01,
    },
    leftText: {
      marginRight: 15,
    },
    rightText: {
      marginLeft: 'auto',
      alignItems: 'flex-end',
    },
    transactionDetails: {
      color: themeColors.placeholder,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.02,
      paddingTop: 4,
    },
    divider: {
      height: 1,
      width: '100%',
      marginTop: 4,
    },
  });
  return styles;
};

interface Props {
  navigation: PaymentHistoryScreenNavigationProp;
  route: { params: any };
}

export const PaymentHistory = ({ route, navigation }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();

    const { payment: paymentsStore } = useStores();
    const styles = createStyles(themeColors);
    const { selectedUnitPayment } = paymentsStore;

    const unitName = getUnitName(selectedUnitPayment as PaymentInfo);
    const { allPastTransactions } = route.params;

    const getPaymentTransactionText = (transactionType: string) => {
      switch (transactionType) {
        case PaymentTypes.DECLINES:
          return t('DECLINED_PAYMENT');
        case PaymentTypes.PAYMENTS:
          return t('PAYMENT');
        case PaymentTypes.REFUNDS:
          return t('REFUND');
        case PaymentTypes.REVERSALS:
          return t('REVERSAL');
        default:
          return t('VOIDED_PAYMENT');
      }
    };

    const getPaymentMsg = (transactionType: string, methodChannel: string, lastFour: string) => {
      const transactionText = getPaymentTransactionText(transactionType);
      const transactionChannel = getPaymentMethodText(methodChannel);

      return `${transactionText} - ${transactionChannel} #${lastFour}`;
    };

    const getReason = (transactionType: string) => {
      switch (transactionType) {
        case PaymentTypes.DECLINES:
          return t('DECLINE_REASON');
        case PaymentTypes.REFUNDS:
          return t('REFUND_REASON');
        case PaymentTypes.VOIDS:
          return t('VOID_REASON');
        default:
          return t('DESCRIPTION');
      }
    };

    const getReasonMsg = (transactionType: string, reason: string) => {
      switch (transactionType) {
        case PaymentTypes.DECLINES:
          return t('INSUFFICIENT_FUNDS');
        case PaymentTypes.REVERSALS:
          return t('CHARGED_BACK_PAYMENT');
        case PaymentTypes.REFUNDS:
          return reason;
        default:
          return t('DUPLICATE_PAYMENT');
      }
    };

    const renderDetailRow = (leftText: string, rightText: string) => (
      <View style={styles.row}>
        <Text style={styles.transactionDetails}>{leftText}</Text>
        <Text style={[styles.transactionDetails, styles.rightText]}>{rightText}</Text>
      </View>
    );

    const renderItem = ({ item }: ListRenderItemInfo<PaymentTransactionsHistory>) => {
      const {
        transactionType,
        method,
        providerTransactionId,
        date,
        totalAmount: totalAmountFromItem,
        reason = '',
        providerRefundedTransactionId,
        reversalTransactionId,
      } = item;

      const isPayment = transactionType === PaymentTypes.PAYMENTS;
      const isRefund = transactionType === PaymentTypes.REFUNDS;
      const isDecline = transactionType === PaymentTypes.DECLINES;
      const isReversal = transactionType === PaymentTypes.REVERSALS;

      const amount = item.amount || item.voidAmount || item.refundAmount || item.reversalAmount || 0;
      const fee = item.fee || 0;
      const totalAmount = isPayment || isDecline ? totalAmountFromItem : -totalAmountFromItem;
      const referenceNumber = reversalTransactionId || providerTransactionId;

      return (
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={[styles.firstRowText, styles.leftText]}>
              {getPaymentMsg(transactionType, method.channelType, method.lastFour)}
            </Text>
            <Text style={[styles.firstRowText, styles.rightText]}>{formatAsCurrency(totalAmount)}</Text>
          </View>
          {renderDetailRow(t('DATE'), toMoment(date).format(MONTH_DATE_TIME_FORMAT))}
          <Divider style={styles.divider} />
          {isPayment && (
            <View>
              {renderDetailRow(t('AMOUNT'), formatAsCurrency(amount))}
              {renderDetailRow(t('SERVICE_FEE'), formatAsCurrency(fee))}
              <Divider style={styles.divider} />
              {renderDetailRow(t('REFERENCE_NUMBER'), `#${providerTransactionId}`)}
            </View>
          )}
          {!isPayment && (
            <View>
              {isReversal && (
                <View>
                  {renderDetailRow(t('REVERSAL_FEE'), formatAsCurrency(item.reversalFee))}
                  <Divider style={styles.divider} />
                </View>
              )}
              {renderDetailRow(t('REFERENCE_NUMBER'), `#${referenceNumber}`)}
              {isRefund && (
                <View>{renderDetailRow(t('PAYMENT_REFERENCE_NUMBER'), `#${providerRefundedTransactionId}`)}</View>
              )}
              {renderDetailRow(getReason(transactionType), getReasonMsg(transactionType, reason))}
            </View>
          )}
        </View>
      );
    };

    return (
      <Screen title={t('PAYMENTS_HISTORY_TITLE', { unit: unitName })} navigation={navigation} mode="detail">
        <FlatList data={allPastTransactions} renderItem={renderItem} scrollEnabled />
        <LinearGradient bottomPosition={0} />
      </Screen>
    );
  });
