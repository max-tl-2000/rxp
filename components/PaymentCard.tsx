import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { Caption, Card } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import { t } from '../i18n/trans';
import { withCondition } from '../helpers/typography';
import { PaymentInfo } from '../mobx/stores/paymentTypes';
import { ThemeColors } from '../helpers/theme';
import { Text } from './Typography';
import { getDueDates, getBalance, getDueText, getUnitName } from '../helpers/payments';
import { useAppTheme } from '../hooks/use-app-theme';

interface PaymentCardProps {
  paymentInfo: PaymentInfo;
  onPress(selectedInfo: PaymentInfo): void;
}

interface Styles {
  content: ViewStyle;
  card: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  dueText: TextStyle;
  warning: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const styles: Styles = {
    card: {
      margin: 4,
    },
    content: {
      flexDirection: 'row',
      padding: 16,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      lineHeight: 20,
    },
    dueText: {
      lineHeight: 16,
      color: themeColors.text,
    },
    warning: {
      color: themeColors.accentSecondary,
    },
  };

  return StyleSheet.create(styles);
};

export const PaymentCard = (props: PaymentCardProps): JSX.Element =>
  useObserver(() => {
    const { paymentInfo, onPress } = props;

    const { integrationIdIsMissing } = paymentInfo.unitUserInfo;

    const { colors: themeColors } = useAppTheme();

    const styles = createStyles(themeColors);

    const unitName = getUnitName(paymentInfo as PaymentInfo);
    const { balance, formattedBalance } = getBalance(paymentInfo);
    const { dueDays, dueDate } = getDueDates(paymentInfo);
    const warningStyle = withCondition(paymentInfo.hasOverduePayments, styles.warning);

    const balanceDetails = paymentInfo.hasOverduePayments
      ? t('OVERDUE_BY_DATE', { balance: formattedBalance, date: dueDate })
      : t('BALANCE_DUE_BY_DATE', { balance: formattedBalance, date: dueDate });

    const dueText = getDueText(dueDays, paymentInfo.hasOverduePayments);

    const displayCardSummaryData = () => {
      if (integrationIdIsMissing) return <Caption style={styles.dueText}>{t('NO_PAYMENT_INFORMATION_YET')}</Caption>;
      if (balance <= 0) return <Caption style={styles.dueText}>{t('NO_CHARGES_DUE_AT_THIS_TIME')}</Caption>;

      return (
        <>
          <Caption style={[styles.dueText, warningStyle]}>{balanceDetails}</Caption>
          <Caption style={[styles.dueText, warningStyle]}>{dueText}</Caption>
        </>
      );
    };

    return (
      <Card style={styles.card} onPress={() => onPress(paymentInfo)}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title} fontWeight="medium">
              {unitName}
            </Text>
            {displayCardSummaryData()}
          </View>
        </View>
      </Card>
    );
  });
