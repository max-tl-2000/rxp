import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import sumBy from 'lodash/sumBy';
import capitalize from 'lodash/capitalize';

import { t } from '../i18n/trans';
import { useStores } from '../mobx/useStores';
import { PaymentsScreenNavigationProp } from '../types';
import {
  Screen,
  Text,
  ExpandableView,
  Caption,
  Title,
  Paragraph,
  PaymentMenuItems,
  ScheduledPaymentCard,
  LinearGradient,
  Banner,
  InfoDialog,
  LoadingPictograph,
  PaymentErrorComponent,
} from '../components';
import {
  getDueDates,
  getBalance,
  formatAsCurrency,
  getGroupCharges,
  getAllPastTransactions,
  getPaymentMethodText,
  getUnitName,
  getNextScheduledPayment,
} from '../helpers/payments';
import {
  PaymentInfo,
  PaymentTransactionsHistory,
  PaymentMethodChannel,
  PaymentTypes,
} from '../mobx/stores/paymentTypes';
import { toMoment } from '../helpers/moment-utils';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { MissingPaymentIntegrationError } from './MissingPaymentIntegrationError';
import { useDialogState } from '../helpers/use-dialog-state';
import { MONTH_DATE_YEAR_FORMAT } from '../constants/date_formats';

const chargeDetailsDimensions = {
  lineHeight: 16,
  marginBottom: 12,
  typographyDefaultVerticalMargin: 2,
};

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 14,
      paddingHorizontal: 16,
    },
    scrollView: {
      width: '100%',
    },
    defaultTextColor: {
      color: themeColors.secondary,
    },
    dueText: {
      lineHeight: 20,
      textAlign: 'center',
    },
    balanceText: {
      marginTop: 4,
      lineHeight: 28,
    },
    payNowButton: {
      marginTop: 10,
      width: '100%',
    },
    containedButtonLabel: {
      color: themeColors.onPrimary,
    },
    divider: {
      height: 1,
      width: '100%',
    },
    detailsButton: {
      marginTop: 10,
    },
    overdueColor: {
      color: themeColors.accentSecondary,
    },
    overdueBackground: {
      backgroundColor: themeColors.accent,
    },
    detailsContainer: {
      width: '100%',
      marginTop: 10,
    },
    fullWidth: {
      width: '100%',
    },
    chargeRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: chargeDetailsDimensions.marginBottom,
    },
    detailsText: {
      color: themeColors.text,
      lineHeight: chargeDetailsDimensions.lineHeight,
    },
    concessionAmount: {
      color: themeColors.secondary,
    },
    unavailableTransactionsText: {
      color: themeColors.text,
      letterSpacing: 0.02,
      marginTop: 16,
    },
    sectionTitle: {
      lineHeight: 20,
      letterSpacing: 0.01,
    },
    card: {
      marginTop: 16,
    },
    firstRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    secondaryRow: {
      color: themeColors.placeholder,
    },
    cardText: {
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.02,
    },
    button: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: 4,
      marginBottom: 8,
      marginLeft: -15,
    },
    daysAgoText: {
      flexDirection: 'row',
    },
    buttonLabel: {
      color: themeColors.secondary,
      marginVertical: 15,
    },
    detailsButtonContainer: {
      flexDirection: 'row',
    },
    marginRight: {
      marginRight: 16,
    },
    additionalContent: {
      alignItems: 'flex-start',
      paddingHorizontal: 24,
      paddingBottom: 12,
    },
    noScheduledPaymentsText: {
      color: themeColors.placeholder,
      marginTop: 16,
    },
    paymentBalanceFinePrint: {
      color: themeColors.text,
      marginTop: 10,
    },
    bannerTextStyle: {
      color: themeColors.error,
    },
  });

  return styles;
};

interface Props {
  navigation: PaymentsScreenNavigationProp;
  route: { params?: { shouldNotDisplayPaymentNotification?: boolean; shouldNotLoadPaymentInfo?: boolean } };
}

const formatDueInfo = (
  unitPayment: PaymentInfo,
  isBalancePositive: boolean,
): { dueText: string; dateText: string; daysAgoText: string; isPastDue: boolean } => {
  const { dueDays, absDueDays, dueDate, isPastDue, chargeDate } = getDueDates(unitPayment);

  const displayDueDays =
    absDueDays <= 1
      ? chargeDate.calendar().split(/\s/)[0].toLowerCase() // yesterday/today/tomorrow
      : absDueDays;

  const getDueText = () => {
    if (!dueDays || !isBalancePositive) return t('YOUR_ALL_SET');
    if (dueDays === -1) return t('YOUR_CURRENT_BALANCE_WAS_DUE');
    if (dueDays < -1) return t('YOUR_CURRENT_BALANCE_IS_OVERDUE');
    return t('YOUR_CURRENT_BALANCE_IS_DUE');
  };

  const dueText = getDueText();

  const getDateText = () => {
    if (!dueDays || !isBalancePositive) return '';
    if (absDueDays <= 1) return `${displayDueDays}, ${dueDate}`; // yesterday/today/tomorrow, May 6, 2020
    if (dueDays < -1) return t('SINCE_DATE', { date: dueDate });
    return t('IN_DAYS_DATE', { days: dueDays });
  };

  const dateText = getDateText();

  const getDaysAgoText = () => {
    if (absDueDays > 1 && isBalancePositive) return t('DAYS_AGO', { days: absDueDays });
    return '';
  };

  const daysAgoText = getDaysAgoText();

  return { dueText, dateText, daysAgoText, isPastDue };
};

const getPaymentMsgText = (transactionType: string, methodText: string) => {
  switch (transactionType) {
    case PaymentTypes.DECLINES:
      return t('DECLINE_HISTORY_MSG', { method: methodText });
    case PaymentTypes.PAYMENTS:
      return t('PAYMENT_HISTORY_MSG', { method: methodText });
    case PaymentTypes.REFUNDS:
      return t('REFUND_HISTORY_MSG', { method: methodText });
    case PaymentTypes.REVERSALS:
      return t('REVERSAL_HISTORY_MSG', { method: methodText });
    default:
      return t('VOID_HISTORY_MSG', { method: methodText });
  }
};

const getPaymentMsg = (transactionType: string, methodChannel: string) => {
  const methodText = getPaymentMethodText(methodChannel, true);
  const paymentMsgText = getPaymentMsgText(transactionType, methodText);

  return methodChannel !== PaymentMethodChannel.ACH ? capitalize(paymentMsgText) : paymentMsgText;
};

export const UnitPayments = ({ navigation, route }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();

    const { payment, units, notification, userSettings } = useStores();
    const { propertyTimezone } = userSettings.propertySelected;
    const { selectedPropertyId } = userSettings;
    const styles = createStyles(themeColors);
    const {
      selectedUnitPayment,
      isPaymentSuccessful,
      dismissPaymentStatus,
      paymentNotPermitted,
      scheduledPaymentsByDayOfMonth,
    } = payment;
    const { balance, formattedBalance } = getBalance(selectedUnitPayment);
    const isBalancePositive = balance > 0;

    const allPastTransactions = getAllPastTransactions(selectedUnitPayment);
    const pastDisplayedTransactions = allPastTransactions.slice(0, 6);
    const unitName = getUnitName(selectedUnitPayment);
    const noChargesAvailable = !selectedUnitPayment?.currentCharges?.length;

    const { integrationIdIsMissing, isPastResident } = selectedUnitPayment?.unitUserInfo || {};

    const [isPaymentBlockedDialogOpen, showPaymentBlockedDialog, hidePaymentBlockedDialog] = useDialogState();
    const [isCannotPerformPmtDialogOpen, showCannotPerformPmtDialog, hideCannotPerformPaymentDialog] = useDialogState();

    useEffect(() => {
      if (!route.params?.shouldNotLoadPaymentInfo) payment.getPaymentInfo();
    }, [selectedPropertyId]);

    useEffect(() => {
      if (isPaymentSuccessful && !route.params?.shouldNotDisplayPaymentNotification) {
        notification.enqueue({ userMessage: t('PAYMENT_SUCCESSFUL') }, dismissPaymentStatus);
      }
    }, [isPaymentSuccessful]);

    const [showDetails, setShowDetails] = useState(false);
    const groupedCharges = getGroupCharges(selectedUnitPayment?.currentCharges || []);

    const detailsRowHeight =
      chargeDetailsDimensions.lineHeight +
      chargeDetailsDimensions.marginBottom +
      2 * chargeDetailsDimensions.typographyDefaultVerticalMargin; // identified by inspection

    const detailsSectionHeight = sumBy(
      groupedCharges,
      charges => detailsRowHeight + charges.amountsByType.length * detailsRowHeight,
    );

    const handlePayPress = () => {
      if (isPastResident) {
        showPaymentBlockedDialog();
        return;
      }
      if (paymentNotPermitted) {
        showCannotPerformPmtDialog();
        return;
      }

      if (noChargesAvailable || !isBalancePositive) navigation.navigate('SchedulePayment');
      else navigation.navigate('MakePayment');
    };

    const renderTransactionItem = (item: PaymentTransactionsHistory) => {
      const { transactionType, method, date, totalAmount: totalAmountFromItem } = item;

      const isPayment = transactionType === PaymentTypes.PAYMENTS;
      const isDecline = transactionType === PaymentTypes.DECLINES;

      const totalAmount = isPayment || isDecline ? totalAmountFromItem : -totalAmountFromItem;

      return (
        <View style={styles.card} key={item.key}>
          <View style={styles.firstRow}>
            <Text style={styles.cardText}>{toMoment(date).format(MONTH_DATE_YEAR_FORMAT)}</Text>
            <Text style={[styles.cardText]}>{formatAsCurrency(totalAmount)}</Text>
          </View>
          <Text style={[styles.cardText, styles.secondaryRow]}>
            {getPaymentMsg(transactionType, method.channelType)}
          </Text>
        </View>
      );
    };

    const renderTransactionsHistory = () => (
      <View style={styles.fullWidth}>
        <Paragraph fontWeight="bold" style={styles.sectionTitle}>
          {t('PAYMENT_HISTORY')}
        </Paragraph>
        {pastDisplayedTransactions.length ? (
          <>
            {pastDisplayedTransactions.map(renderTransactionItem)}
            <Button
              style={styles.button}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate('PaymentHistory', { allPastTransactions })}
            >
              {t('SHOW_FULL_HISTORY')}
            </Button>
          </>
        ) : (
          <Caption style={styles.unavailableTransactionsText}>{t('UNAVAILABLE_PAST_TRANSACTIONS')}</Caption>
        )}
      </View>
    );

    const isConcessionCharge = (type: string) => type.toUpperCase() === 'CONCESSION';

    const noScheduledPayments = !payment.scheduledPayments?.length;

    const handleSchedulePaymentAction = () => {
      if (!noScheduledPayments) {
        navigation.navigate('ManageScheduledPayments');
        return;
      }

      if (isPastResident) {
        showPaymentBlockedDialog();
        return;
      }
      if (paymentNotPermitted) {
        showCannotPerformPmtDialog();
        return;
      }

      navigation.navigate('SchedulePayment');
    };

    const renderScheduledPayments = () => {
      return (
        <View style={styles.fullWidth}>
          <Paragraph fontWeight="bold" style={styles.sectionTitle}>
            {t('SCHEDULED_PAYMENTS')}
          </Paragraph>
          <View>
            {noScheduledPayments ? (
              <Caption style={styles.noScheduledPaymentsText}>{t('NO_SCHEDULED_PAYMENTS_MSG')}</Caption>
            ) : (
              payment.scheduledPayments?.map(item => <ScheduledPaymentCard item={item} key={item.providerId} />)
            )}
          </View>
          <Button style={styles.button} labelStyle={styles.buttonLabel} onPress={handleSchedulePaymentAction}>
            {noScheduledPayments ? t('SCHEDULE_A_PAYMENT') : t('MANAGE_SCHEDULED_PAYMENTS')}
          </Button>
        </View>
      );
    };

    const renderDetails = () => {
      const { dueText, dateText, daysAgoText, isPastDue } = formatDueInfo(
        selectedUnitPayment as PaymentInfo, // if it gets here, selectedUnitPayment is not null so casting to fix types
        isBalancePositive,
      );

      const nextScheduledPayment =
        scheduledPaymentsByDayOfMonth && getNextScheduledPayment(scheduledPaymentsByDayOfMonth, propertyTimezone);
      const zeroBalance = balance === 0;

      return (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={[styles.dueText]}>{dueText}</Text>
            <View style={styles.daysAgoText}>
              {!!dateText && <Text style={[styles.dueText]}>{dateText}</Text>}
              {!!daysAgoText && <Text style={[styles.dueText]}>{', '}</Text>}
              {!!daysAgoText && <Text style={[styles.dueText, isPastDue && styles.overdueColor]}>{daysAgoText}</Text>}
            </View>
            <Title style={styles.balanceText}>{formattedBalance}</Title>
            {!!nextScheduledPayment && (
              <Text style={styles.dueText}>{`${t('NEXT_SCHEDULED_PAYMENT')}: ${nextScheduledPayment}`}</Text>
            )}
            <Button
              mode="contained"
              style={[styles.payNowButton, isPastDue && styles.overdueBackground]}
              labelStyle={styles.containedButtonLabel}
              onPress={handlePayPress}
            >
              {noChargesAvailable || !isBalancePositive ? t('SCHEDULE_A_PAYMENT') : t('PAY_NOW')}
            </Button>
            <Caption fontStyle="italic" style={styles.paymentBalanceFinePrint}>
              {t('PAYMENTS_TAKE_TIME_TO_REFLECT_BALANCE')}
            </Caption>
            <ExpandableView style={styles.detailsContainer} expanded={showDetails} height={detailsSectionHeight}>
              {groupedCharges.map(group => (
                <View style={styles.fullWidth} key={group.dueDate}>
                  <View style={styles.chargeRow}>
                    <Caption fontWeight="bold" style={styles.detailsText}>
                      {t('DUE_BY_DATE', { date: toMoment(group.dueDate).format('MMMM Do, YYYY') })}
                    </Caption>
                    <Caption fontWeight="bold" style={styles.detailsText}>
                      {formatAsCurrency(group.totalAmount)}
                    </Caption>
                  </View>
                  {group.amountsByType.map(({ type, amount, clientGeneratedId }) => (
                    <View style={styles.chargeRow} key={clientGeneratedId}>
                      <Caption style={styles.detailsText}>{type}</Caption>
                      <Caption style={[styles.detailsText, isConcessionCharge(type) && styles.concessionAmount]}>
                        {`${isConcessionCharge(type) ? `${t('SAVE')}: ` : ''}${formatAsCurrency(Math.abs(amount))}`}
                      </Caption>
                    </View>
                  ))}
                </View>
              ))}
            </ExpandableView>
            <Divider style={styles.divider} />
            <View style={styles.detailsButtonContainer}>
              {zeroBalance && (
                <Button
                  style={[styles.detailsButton, !noChargesAvailable && styles.marginRight]}
                  labelStyle={styles.defaultTextColor}
                  onPress={() => navigation.navigate('MakePayment')}
                >
                  {t('PAY_NOW')}
                </Button>
              )}
              {!noChargesAvailable && (
                <Button
                  style={styles.detailsButton}
                  labelStyle={styles.defaultTextColor}
                  onPress={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? t('HIDE_DETAILS') : t('SHOW_DETAILS')}
                </Button>
              )}
            </View>
          </View>
          <View style={styles.additionalContent}>
            {renderScheduledPayments()}
            {renderTransactionsHistory()}
          </View>
        </ScrollView>
      );
    };

    if (integrationIdIsMissing) return <MissingPaymentIntegrationError navigation={navigation} />;

    const renderContent = () => (
      <>
        <Banner visible={paymentNotPermitted} textStyle={styles.bannerTextStyle}>
          {t('ACCOUNT_BLOCKED')}
        </Banner>
        {!selectedUnitPayment ? <PaymentErrorComponent token={payment.errorToken} /> : renderDetails()}
        <LinearGradient bottomPosition={0} />
        <InfoDialog
          visible={isPaymentBlockedDialogOpen}
          onDismiss={hidePaymentBlockedDialog}
          title={t('CANNOT_PERFORM_PAYMENT')}
          content={t('NO_LONGER_LEASING_THIS_UNIT')}
        />
        <InfoDialog
          visible={isCannotPerformPmtDialogOpen}
          onDismiss={hideCannotPerformPaymentDialog}
          title={t('CANNOT_PROCESS_PAYMENTS_TITLE')}
          content={t('CANNOT_PROCESS_PAYMENTS_BODY')}
          buttonLabel={t('I_UNDERSTAND')}
        />
      </>
    );

    const getScreenTitle = () =>
      payment.isPaymentInfoLoading ? t('PAYMENTS') : `${t('PAYMENTS')} ${unitName ? `- ${unitName}` : ''}`;

    return (
      <Screen
        title={getScreenTitle()}
        navigation={navigation}
        mode={units.hasMultipleUnits ? 'detail' : 'screen'}
        {...(payment.selectedUnitPayment && !payment.isPaymentInfoLoading && { menuItems: PaymentMenuItems })}
      >
        {payment.isPaymentInfoLoading ? <LoadingPictograph message={t('PAYMENT_LOADING_MSG')} /> : renderContent()}
      </Screen>
    );
  });
