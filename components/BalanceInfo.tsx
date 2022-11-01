import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-paper';

import { PaymentInfo } from '../mobx/stores/paymentTypes';
import { getBalance, getDueDates, getDueText, getUnitName } from '../helpers/payments';
import { useStores } from '../mobx/useStores';
import { Title, Text } from './Typography';
import { t } from '../i18n/trans';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    balanceInfoContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    balanceUnitContainer: {
      marginRight: 8,
      flex: 1,
    },
    balanceText: {
      lineHeight: 20,
    },
    divider: {
      width: '100%',
      marginVertical: 6,
    },
    warning: {
      color: themeColors.accentSecondary,
    },
  });
  return styles;
};

export const BalanceInfo = () =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

    const { payment } = useStores();
    const { selectedUnitPayment } = payment;
    const unitPayment = selectedUnitPayment as PaymentInfo;

    const { formattedBalance } = getBalance(unitPayment);

    const { dueDays, isPastDue } = getDueDates(unitPayment);
    const dateDetails = getDueText(dueDays, isPastDue);
    const unitName = getUnitName(unitPayment);

    return (
      <>
        <View style={styles.balanceInfoContainer}>
          <View style={styles.balanceUnitContainer}>
            <Text style={styles.balanceText} fontWeight="medium">
              {t('YOUR_BALANCE_AT_UNIT', { unitName })}
            </Text>
            <Text style={[styles.balanceText, isPastDue && styles.warning]}>{dateDetails}</Text>
          </View>
          <Title>{formattedBalance}</Title>
        </View>
        <Divider style={styles.divider} />
      </>
    );
  });
