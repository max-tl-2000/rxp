import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Button, Portal, Paragraph } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { useFocusEffect } from '@react-navigation/native';

import { PaymentInfo, AmountType, PaymentMethod } from '../mobx/stores/paymentTypes';
import { t } from '../i18n/trans';
import { Alert, Icons } from '../helpers/icons';
import * as icons from '../helpers/icons';
import {
  RadioButton,
  Screen,
  CurrencyInput,
  Text,
  Caption,
  Dialog,
  LinearGradient,
  BalanceInfo,
  InfoDialog,
} from '../components';
import { useStores } from '../mobx/useStores';
import { PaymentsScreenNavigationProp } from '../types';
import {
  getBalance,
  getPaymentMethodIconName,
  getPaymentMethodText,
  getPaymentFeeText,
  MAXIMUM_ALLOWED_PAYMENT,
  formatAsCurrency,
} from '../helpers/payments';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { useDialogState } from '../helpers/use-dialog-state';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      alignItems: 'flex-start',
      padding: 16,
    },
    payText: {
      marginTop: 20,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    warning: {
      color: themeColors.accentSecondary,
    },
    amountWarning: {
      marginLeft: 25,
      color: themeColors.error,
    },
    buttonLabel: {
      color: themeColors.secondary,
      marginHorizontal: 0,
      marginVertical: 0,
    },
    containedButtonLabel: {
      color: themeColors.onPrimary,
    },
    noMethodWarningCaption: {
      marginLeft: 8,
      fontSize: 14,
    },
    paymentMethodHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingTop: 6,
      paddingBottom: 16,
    },
    paymentMethodContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      width: '100%',
    },
    addPaymentMethodContainer: {
      marginVertical: 19,
    },
    reviewPaymentContainer: {
      paddingHorizontal: 16,
      paddingBottom: 18,
    },
    maxWidth: {
      width: '100%',
    },
    defaultTextColor: {
      color: themeColors.text,
    },
    secondaryTextColor: {
      color: themeColors.secondary,
    },
    changeDefaultDialogActionsStyle: {
      flexWrap: 'wrap',
    },
    changeDefaultDialogButtonStyle: {
      marginHorizontal: 10,
    },
    onlyCardsAllowedText: {
      marginVertical: 10,
    },
    upperLimitMessage: {
      marginLeft: 20,
    },
  });

  return styles;
};

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const MakePayment = ({ navigation }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();

    const { payment } = useStores();
    const styles = createStyles(themeColors);
    const unitPayment = payment.selectedUnitPayment as PaymentInfo;
    const { balance, formattedBalance } = getBalance(unitPayment);
    const balanceExceedsCapLimit = balance > MAXIMUM_ALLOWED_PAYMENT;
    const isBalancePositive = balance > 0;

    const {
      amountType,
      activePaymentMethods,
      defaultPaymentMethod,
      firstValidNonDefaultPaymentMethod,
      fixedAmount,
      isLowerFeeAvailable,
      isNewPaymentMethodReceived,
      makeDefaultPaymentMethod,
      newReceivedPaymentMethod,
      onlyCardPaymentsAllowed,
      selectedPaymentMethod,
      setAmountType,
      setFixedAmount,
      resetAmountAndType,
      setNewPaymentMethodReceived,
      setSelectedPaymentMethod,
      setShouldResetAmountFlag,
    } = payment;
    const [wasFixedAmountEdited, setWasFixedAmountEdited] = useState(false);
    const [showChangePaymentMethod, setShowChangePaymentMethod] = useState(false);
    const [isDefaultExpiredDialogVisible, setIsDefaultExpiredDialogVisible] = useState(false);
    const [isMakeDefaultDialogVisible, setIsMakeDefaultDialogVisible] = useState(false);
    const [
      isDefaultMethodUpdatedDialogOpen,
      showDefaultMethodUpdatedDialog,
      hideIsDefaultMethodUpdatedDialog,
    ] = useDialogState();
    const isFirstActivePaymentMethod = activePaymentMethods?.length === 1;

    const checkIfNewMethodWasAdded = () => {
      if (isNewPaymentMethodReceived) {
        if (!isDefaultMethodUpdatedDialogOpen && isFirstActivePaymentMethod) showDefaultMethodUpdatedDialog();
        if (!isMakeDefaultDialogVisible && !isFirstActivePaymentMethod) setIsMakeDefaultDialogVisible(true);
      }
    };

    checkIfNewMethodWasAdded();

    const onAmountChange = (value: number) => {
      setFixedAmount(value);
      setWasFixedAmountEdited(true);
    };

    useEffect(() => {
      const type = isBalancePositive ? AmountType.Balance : AmountType.Fixed;
      setAmountType(type);

      if (amountType === AmountType.Fixed && !!fixedAmount) {
        setWasFixedAmountEdited(true);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        payment.shouldResetAmount && resetAmountAndType();
        return () => {
          setShouldResetAmountFlag(true);
        };
      }, []),
    );

    const fixedAmountIsInvalid =
      wasFixedAmountEdited &&
      amountType === AmountType.Fixed &&
      (fixedAmount < 1 || fixedAmount > MAXIMUM_ALLOWED_PAYMENT);

    const renderPaymentMethodIcon = (paymentMethod: PaymentMethod): JSX.Element => {
      const iconName = getPaymentMethodIconName(paymentMethod);
      const Icon = (icons as Icons)[iconName as keyof Icons] as Function;
      return <Icon width={32} height={32} fill={themeColors.placeholder} />;
    };

    const renderPaymentMethod = (paymentMethod: PaymentMethod) => {
      const feeText = getPaymentFeeText(paymentMethod);

      return (
        <View style={styles.paymentMethodContainer}>
          <View>
            <Text>{`${getPaymentMethodText(paymentMethod.channelType)} #${paymentMethod.lastFour}`}</Text>
            <View style={styles.row}>
              {!!paymentMethod.expirationDate && (
                <Caption>{`${t('EXPIRATION_DATE')}: ${paymentMethod.expirationDate}, `}</Caption>
              )}
              <Caption>{feeText}</Caption>
            </View>
          </View>
          {renderPaymentMethodIcon(paymentMethod)}
        </View>
      );
    };
    const closeMakeDefaultDialog = () => {
      setIsMakeDefaultDialogVisible(false);
      setNewPaymentMethodReceived(false);
    };

    const handlePageAction = () => {
      if (!selectedPaymentMethod || !activePaymentMethods?.length) {
        navigation.navigate('AddPaymentMethod');
        return;
      }

      if (selectedPaymentMethod.isExpired) {
        setIsDefaultExpiredDialogVisible(true);
        return;
      }

      if ((amountType === AmountType.Fixed && !wasFixedAmountEdited) || (!isBalancePositive && fixedAmount < 1)) {
        setAmountType(AmountType.Fixed);
        setWasFixedAmountEdited(true);
        return;
      }
      navigation.navigate('ReviewPayment');
    };

    const selectedPaymentMethodName =
      selectedPaymentMethod &&
      `${getPaymentMethodText(selectedPaymentMethod.channelType)} #${selectedPaymentMethod.lastFour}`;
    const selectedPaymentMethodExpirationDate = selectedPaymentMethod && selectedPaymentMethod.expirationDate;
    const newDefaultSelectedPayment =
      firstValidNonDefaultPaymentMethod &&
      `${getPaymentMethodText(firstValidNonDefaultPaymentMethod.channelType)} #${
        firstValidNonDefaultPaymentMethod.lastFour
      }`;
    const newDefaultPaymentMethod = newReceivedPaymentMethod || activePaymentMethods?.[0];
    const { channelType, lastFour } = newDefaultPaymentMethod || {};
    const paymentTypeDialogString = `${getPaymentMethodText(channelType)} #${lastFour}`;

    const setNewAddedMethodAsDefault = () => {
      newDefaultPaymentMethod?.id && makeDefaultPaymentMethod(newDefaultPaymentMethod?.id);

      hideIsDefaultMethodUpdatedDialog();
      setNewPaymentMethodReceived(false);
    };

    return (
      <Screen title={t('MAKE_A_PAYMENT')} navigation={navigation} mode="detail" contentInSafeView hasInputs>
        <ScrollView contentContainerStyle={styles.content}>
          <BalanceInfo />
          <Text style={styles.payText} fontWeight="bold">
            {t('I_WOULD_LIKE_TO_PAY')}
          </Text>
          <RadioButton
            disabled={!isBalancePositive}
            checked={amountType === AmountType.Balance}
            label={t('MY_BALANCE_VALUE', {
              balance: balanceExceedsCapLimit ? `${formatAsCurrency(MAXIMUM_ALLOWED_PAYMENT)}*` : formattedBalance,
            })}
            onPress={() => isBalancePositive && setAmountType(AmountType.Balance)}
          />
          {balanceExceedsCapLimit && (
            <Text fontStyle="italic" style={styles.upperLimitMessage}>
              {t('PAYMENT_UPPER_LIMIT_MESSAGE')}
            </Text>
          )}
          <View style={styles.row}>
            <RadioButton
              checked={amountType === AmountType.Fixed}
              label={t('FIXED_AMOUNT')}
              onPress={() => setAmountType(AmountType.Fixed)}
            />
            {amountType === AmountType.Fixed && <CurrencyInput value={fixedAmount} onValueChange={onAmountChange} />}
          </View>
          {fixedAmountIsInvalid && (
            <Caption style={styles.amountWarning}>
              {t('PAYMENT_AMOUNT_WARNING', { balance: formatAsCurrency(MAXIMUM_ALLOWED_PAYMENT) })}
            </Caption>
          )}
          <View style={styles.paymentMethodHeader}>
            <Text fontWeight="bold">{t('PAYMENT_METHOD')}</Text>
            {!!activePaymentMethods?.length && !showChangePaymentMethod && (
              <Button
                labelStyle={[styles.buttonLabel, isLowerFeeAvailable && styles.warning]}
                onPress={() => {
                  setShowChangePaymentMethod(true);
                  setSelectedPaymentMethod(defaultPaymentMethod);
                }}
              >
                {t('CHANGE_METHOD')}
              </Button>
            )}
          </View>
          {onlyCardPaymentsAllowed && <Text style={styles.onlyCardsAllowedText}>{t('ONLY_CARDS_ALLOWED')}</Text>}
          {!activePaymentMethods?.length && (
            <View style={styles.row}>
              <Alert fill={themeColors.accent} width={21.8} height={19} />
              <Caption style={[styles.warning, styles.noMethodWarningCaption]}>{t('NO_PAYMENT_METHOD_MSG')}</Caption>
            </View>
          )}
          {!showChangePaymentMethod &&
            defaultPaymentMethod &&
            !defaultPaymentMethod.isExpired &&
            renderPaymentMethod(defaultPaymentMethod)}
          {!showChangePaymentMethod && isLowerFeeAvailable && (
            <Caption style={styles.warning}>{t('IS_LOWER_FEE_AVAILABLE_MSG')}</Caption>
          )}
          {showChangePaymentMethod && activePaymentMethods?.length && (
            <>
              {activePaymentMethods.map(pm => (
                <View key={pm.id} style={styles.maxWidth}>
                  <RadioButton
                    checked={pm.id === selectedPaymentMethod?.id}
                    onPress={() => setSelectedPaymentMethod(pm)}
                    label={renderPaymentMethod(pm)}
                    contentContainerStyle={styles.maxWidth}
                  />
                </View>
              ))}
              <View style={styles.addPaymentMethodContainer}>
                <Button labelStyle={styles.buttonLabel} onPress={() => navigation.navigate('AddPaymentMethod')}>
                  {t('ADD_PAYMENT_METHOD')}
                </Button>
              </View>
            </>
          )}
        </ScrollView>
        <View style={styles.reviewPaymentContainer}>
          <LinearGradient />
          <Button
            disabled={fixedAmountIsInvalid}
            mode="contained"
            style={styles.maxWidth}
            labelStyle={styles.containedButtonLabel}
            onPress={handlePageAction}
          >
            {selectedPaymentMethod && activePaymentMethods?.length ? t('REVIEW_PAYMENT') : t('ADD_PAYMENT_METHOD')}
          </Button>
        </View>

        <Portal>
          <Dialog visible={isDefaultExpiredDialogVisible} onDismiss={() => setIsDefaultExpiredDialogVisible(false)}>
            <Dialog.Title>{t('DEFAULT_PAYMENT_EXPIRED_TITLE')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                {t('DEFAULT_PAYMENT_EXPIRED', {
                  payment: selectedPaymentMethodName,
                  newPayment: newDefaultSelectedPayment,
                  expirationDate: selectedPaymentMethodExpirationDate,
                })}
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions style={styles.changeDefaultDialogActionsStyle}>
              <Button
                style={styles.changeDefaultDialogButtonStyle}
                labelStyle={styles.secondaryTextColor}
                onPress={() => {
                  setIsDefaultExpiredDialogVisible(false);
                  navigation.navigate('ManagePaymentMethods');
                }}
              >
                {t('CHANGE_DEFAULT')}
              </Button>
              <Button
                style={styles.changeDefaultDialogButtonStyle}
                onPress={() => {
                  setIsDefaultExpiredDialogVisible(false);
                  setSelectedPaymentMethod(firstValidNonDefaultPaymentMethod);
                  firstValidNonDefaultPaymentMethod?.id &&
                    payment.makeDefaultPaymentMethod(firstValidNonDefaultPaymentMethod?.id);
                  navigation.navigate('ReviewPayment');
                }}
              >
                {t('OK_GOT_IT')}
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={isMakeDefaultDialogVisible} onDismiss={() => closeMakeDefaultDialog()}>
            <Dialog.Title>{t('MAKE_DEFAULT_PAYMENT_TITLE')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{t('MAKE_DEFAULT_PAYMENT_BODY', { payment: paymentTypeDialogString })}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button labelStyle={styles.defaultTextColor} onPress={() => closeMakeDefaultDialog()}>
                {t('KEEP_DEFAULT')}
              </Button>
              <Button
                labelStyle={styles.secondaryTextColor}
                onPress={() => {
                  newReceivedPaymentMethod?.id &&
                    (setSelectedPaymentMethod(newReceivedPaymentMethod),
                    makeDefaultPaymentMethod(newReceivedPaymentMethod?.id));
                  closeMakeDefaultDialog();
                }}
              >
                {t('MAKE_DEFAULT')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <InfoDialog
          visible={isDefaultMethodUpdatedDialogOpen}
          onDismiss={setNewAddedMethodAsDefault}
          title={t('DEFAULT_METHOD_UPDATED_TITLE')}
          content={t('DEFAULT_METHOD_UPDATED_BODY', { payment: paymentTypeDialogString })}
        />
      </Screen>
    );
  });
