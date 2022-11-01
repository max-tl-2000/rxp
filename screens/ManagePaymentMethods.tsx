import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Portal, Button, Paragraph, Divider } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { PaymentInfo, PaymentMethod } from '../mobx/stores/paymentTypes';
import { t } from '../i18n/trans';
import { Screen, FlatList, PaymentMethodCard, Dialog, Pictograph, InfoDialog } from '../components';
import { PaymentsScreenNavigationProp } from '../types';
import { useStores } from '../mobx/useStores';
import { getPaymentMethodText } from '../helpers/payments';
import { Text } from '../components/Typography';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { useDialogState } from '../helpers/use-dialog-state';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      flex: 1,
    },
    listStyle: {
      width: '100%',
      paddingHorizontal: 16,
    },
    defaultTextColor: {
      color: themeColors.text,
    },
    secondaryTextColor: {
      color: themeColors.secondary,
    },
    marginLeft: {
      marginLeft: 16,
    },
    marginBottom: {
      marginBottom: 20,
    },
    emptyStateMessageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noValidMethodStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      marginTop: 25,
    },
    emptyStateMessage: {
      lineHeight: 20,
      textAlign: 'center',
    },
    grayText: {
      color: themeColors.placeholder,
    },
    addPaymentContainer: {
      justifyContent: 'flex-end',
      marginTop: 6,
      paddingBottom: 18,
      paddingHorizontal: 16,
      width: '100%',
    },
    reviewPaymentButton: {
      width: '100%',
    },
    buttonText: {
      color: themeColors.onPrimary,
    },
    messageDivider: {
      height: 1,
      width: '100%',
      marginTop: 40,
      marginBottom: 20,
      marginHorizontal: 16,
    },
  });

  return styles;
};

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const ManagePaymentMethods = ({ navigation }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();

    const { payment } = useStores();
    const styles = createStyles(themeColors);
    const {
      makeDefaultPaymentMethod,
      setNewPaymentMethodReceived,
      resetNewPaymentMethodReceived,
      sortedPayments,
      isNewPaymentMethodReceived,
      firstValidNonDefaultPaymentMethod,
      noValidPaymentMethod,
      onlyCardPaymentsAllowed,
      activePaymentMethods,
    } = payment;

    const [isRemoveDialogVisible, setIsRemoveDialogVisible] = useState(false);
    const [isMakeDefaultDialogVisible, setIsMakeDefaultDialogVisible] = useState(false);
    const [isDefaultMethodUpdatedVisible, setIsDefaultMethodUpdatedVisible] = useState(false);
    const [selectedPaymentMethodForAction, setSelectedPaymentMethodForAction] = useState<PaymentMethod>();

    const { selectedUnitPayment } = payment;
    const { isPastResident } = (selectedUnitPayment as PaymentInfo).unitUserInfo;

    const [isBlockedPaymentDialogOpen, showBlockedPaymentDialog, hideBlockedPaymentDialog] = useDialogState();

    const isFirstActivePaymentMethod = activePaymentMethods?.length === 1;

    const checkIfNewMethodWasAdded = () => {
      if (isNewPaymentMethodReceived) {
        if (!isDefaultMethodUpdatedVisible && isFirstActivePaymentMethod) setIsDefaultMethodUpdatedVisible(true);
        if (!isMakeDefaultDialogVisible && !isFirstActivePaymentMethod) setIsMakeDefaultDialogVisible(true);
      }
    };

    checkIfNewMethodWasAdded();

    const renderPayment = ({ item }: { item: PaymentMethod }) => {
      return (
        <PaymentMethodCard
          onRemovePress={(paymentMethod: PaymentMethod) => {
            setSelectedPaymentMethodForAction(paymentMethod);
            setIsRemoveDialogVisible(true);
          }}
          onMakeDefaultPress={(paymentMethod: PaymentMethod) => {
            setSelectedPaymentMethodForAction(paymentMethod);
            setIsMakeDefaultDialogVisible(true);
          }}
          paymentMethod={item}
          key={item.id}
        />
      );
    };

    const renderEmptyState = () => {
      return (
        <>
          <View style={styles.emptyStateMessageContainer}>
            <Pictograph type="question" />
            <Text style={[styles.emptyStateMessage, styles.marginBottom]}>{t('NO_PAYMENT_METHODS')}</Text>
            <Text style={[styles.emptyStateMessage, styles.grayText]}>{t('NO_PAYMENT_METHODS_NOTE')}</Text>
          </View>
        </>
      );
    };

    const renderNoValidPaymentMethodState = () => {
      const note = onlyCardPaymentsAllowed
        ? t('NO_VALID_CARD_PAYMENT_METHODS_NOTE')
        : t('NO_VALID_PAYMENT_METHODS_NOTE');

      return (
        <>
          <View style={styles.noValidMethodStateContainer}>
            <Text style={[styles.emptyStateMessage, styles.marginBottom]}>{t('NO_VALID_PAYMENT_METHODS')}</Text>
            <Text style={[styles.emptyStateMessage, styles.grayText]}>{note}</Text>
            <Divider style={styles.messageDivider} />
          </View>
        </>
      );
    };

    const closeMakeDefaultDialog = () => {
      setIsMakeDefaultDialogVisible(false);
      setNewPaymentMethodReceived(false);
    };

    const setFirstAddedMethodAsDefault = () => {
      const newDefaultPaymentMethod = payment.newReceivedPaymentMethod || activePaymentMethods?.[0];

      newDefaultPaymentMethod?.id && makeDefaultPaymentMethod(newDefaultPaymentMethod?.id);
      setIsDefaultMethodUpdatedVisible(false);
      setNewPaymentMethodReceived(false);
    };

    const { channelType, lastFour } = payment.newReceivedPaymentMethod || selectedPaymentMethodForAction || {};
    const paymentTypeDialogString = `${getPaymentMethodText(channelType)} #${lastFour}`;

    const onAddPaymentMethodPress = () => {
      if (isPastResident) {
        showBlockedPaymentDialog();
      } else navigation.navigate('AddPaymentMethod');
    };

    return (
      <Screen
        title={t('MANAGE_PAYMENT_METHODS')}
        navigation={navigation}
        mode="modal"
        backScreen="UnitPayments"
        contentInSafeView
      >
        <View style={styles.content}>
          {!!sortedPayments.length && noValidPaymentMethod && renderNoValidPaymentMethodState()}
          {sortedPayments.length ? (
            <FlatList style={styles.listStyle} data={sortedPayments} renderItem={renderPayment} scrollEnabled />
          ) : (
            renderEmptyState()
          )}
          <View style={styles.addPaymentContainer}>
            <Button
              mode="contained"
              style={styles.reviewPaymentButton}
              labelStyle={styles.buttonText}
              onPress={onAddPaymentMethodPress}
            >
              {t('ADD_PAYMENT_METHOD')}
            </Button>
          </View>
        </View>

        <Portal>
          <Dialog visible={isRemoveDialogVisible} onDismiss={() => setIsRemoveDialogVisible(false)}>
            <Dialog.Title>{t('REMOVE_PAYMENT_TITLE', { payment: paymentTypeDialogString })}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{t('REMOVE_PAYMENT_BODY')}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button labelStyle={styles.defaultTextColor} onPress={() => setIsRemoveDialogVisible(false)}>
                {t('CANCEL')}
              </Button>
              <Button
                style={styles.marginLeft}
                labelStyle={styles.secondaryTextColor}
                onPress={() => {
                  navigation.navigate('RemovePaymentMethodInProgress');
                  if (selectedPaymentMethodForAction?.isDefault && firstValidNonDefaultPaymentMethod?.id) {
                    payment.makeDefaultPaymentMethod(firstValidNonDefaultPaymentMethod?.id);
                  }
                  payment.deletePaymentMethod(
                    selectedPaymentMethodForAction?.id,
                    selectedPaymentMethodForAction?.externalId,
                    selectedPaymentMethodForAction?.lastFour,
                  );
                  setIsRemoveDialogVisible(false);
                }}
              >
                {t('YES_REMOVE')}
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={isMakeDefaultDialogVisible} onDismiss={() => closeMakeDefaultDialog()}>
            <Dialog.Title>{t('MAKE_DEFAULT_PAYMENT_TITLE')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{t('MAKE_DEFAULT_PAYMENT_BODY', { payment: paymentTypeDialogString })}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                labelStyle={styles.defaultTextColor}
                onPress={() => {
                  resetNewPaymentMethodReceived();
                  closeMakeDefaultDialog();
                }}
              >
                {t('KEEP_DEFAULT')}
              </Button>
              <Button
                labelStyle={styles.secondaryTextColor}
                onPress={() => {
                  const newDefaultPaymentMethod = payment.newReceivedPaymentMethod || selectedPaymentMethodForAction;

                  newDefaultPaymentMethod?.id && makeDefaultPaymentMethod(newDefaultPaymentMethod?.id);
                  resetNewPaymentMethodReceived();
                  closeMakeDefaultDialog();
                }}
              >
                {t('MAKE_DEFAULT')}
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={isDefaultMethodUpdatedVisible} onDismiss={() => setFirstAddedMethodAsDefault()}>
            <Dialog.Title>{t('DEFAULT_METHOD_UPDATED_TITLE')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{t('DEFAULT_METHOD_UPDATED_BODY', { payment: paymentTypeDialogString })}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button labelStyle={styles.secondaryTextColor} onPress={() => setFirstAddedMethodAsDefault()}>
                {t('OK_GOT_IT')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <InfoDialog
          visible={isBlockedPaymentDialogOpen}
          onDismiss={hideBlockedPaymentDialog}
          title={t('CANNOT_ADD_PAYMENT_METHOD')}
          content={t('NO_LONGER_LEASING_THIS_UNIT_PMT_METHOD')}
        />
      </Screen>
    );
  });
