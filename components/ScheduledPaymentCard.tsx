import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useObserver } from 'mobx-react-lite';
import { formatAsCurrency, getPaymentMethodByExternalId, getPaymentMethodText } from '../helpers/payments';
import { useStores } from '../mobx/useStores';
import { ScheduledPayment } from '../mobx/stores/paymentTypes';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';
import { Caption } from './Typography';
import { toMoment } from '../helpers/moment-utils';
import { t } from '../i18n/trans';
import { MONTH_YEAR_LONG_FORMAT } from '../constants/date_formats';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    card: {
      marginTop: 16,
    },
    firstRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    defaultTextColor: {
      color: themeColors.text,
    },
    text: {
      lineHeight: 16,
      marginVertical: 0,
      letterSpacing: 0.2,
    },
  });

  return styles;
};

interface Props {
  item: ScheduledPayment;
}

const getScheduledPaymentDayOfMonth = (dayOfMonth: string) => {
  switch (dayOfMonth) {
    case 'FIRST_DAY':
    case 'LAST_DAY':
      return `${t(dayOfMonth)} ${t('OF_THE_MONTH')}`;
    default:
      return `${t('DAY_OF_THE_MONTH', { dayOfMonth })}`;
  }
};

export const ScheduledPaymentCard = ({ item }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();

    const { payment } = useStores();
    const styles = createStyles(themeColors);
    const { paymentMethodProviderId, endMonth, dayOfMonth, paymentAmount } = item;
    const paymentMethod = getPaymentMethodByExternalId(
      paymentMethodProviderId?.toString(),
      payment.selectedUnitPayment?.paymentMethods || [],
    );
    const dateText = endMonth
      ? `${t('LAST_MONTH')}: ${toMoment(endMonth).format(MONTH_YEAR_LONG_FORMAT)}`
      : t('WITHOUT_END_DATE');

    return (
      <View style={styles.card}>
        <View style={styles.firstRow}>
          <Caption style={[styles.defaultTextColor, styles.text]}>{getScheduledPaymentDayOfMonth(dayOfMonth)}</Caption>
          <Caption style={[styles.defaultTextColor, styles.text]}>{formatAsCurrency(paymentAmount)}</Caption>
        </View>
        <Caption style={styles.text}>{dateText}</Caption>
        {paymentMethod && (
          <Caption style={styles.text}>
            {`${t('METHOD')}: ${getPaymentMethodText(paymentMethod.channelType)} #${paymentMethod.lastFour}`}
          </Caption>
        )}
      </View>
    );
  });
