import React from 'react';
import { Divider, Menu } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import { t } from '../i18n/trans';
import { useStores } from '../mobx/useStores';
import { InfoDialog } from './InfoDialog';
import { useDialogState } from '../helpers/use-dialog-state';
import { MenuItemsProps } from './AppBar';

export const PaymentMenuItems = ({ navigation, closeOverflowMenu }: MenuItemsProps) =>
  useObserver(() => {
    const { payment } = useStores();
    const { selectedUnitPayment } = payment || {};
    if (!selectedUnitPayment) return <></>;

    const { isPastResident } = selectedUnitPayment.unitUserInfo;

    const [isBlockedPaymentDialogOpen, showBlockedPaymentDialog, hideBlockedPaymentDialog] = useDialogState();
    const [
      isBlockedAddPaymentMethodDialogOpen,
      showBlockedAddPaymentMethodDialog,
      hideBlockedAddPaymentMethodDialog,
    ] = useDialogState();

    const navigateTo = (screen: string, params?: object) => {
      closeOverflowMenu?.();
      navigation.navigate(screen, params);
    };

    const onSchedulePaymentPress = () => {
      if (isPastResident) {
        showBlockedPaymentDialog();
      } else navigateTo('SchedulePayment');
    };

    const onAddPaymentMethodPress = () => {
      if (isPastResident) showBlockedAddPaymentMethodDialog();
      else navigateTo('AddPaymentMethod', { redirectToManagePaymentMethods: true });
    };

    return (
      <>
        <Menu.Item onPress={onSchedulePaymentPress} title={t('SCHEDULE_A_PAYMENT')} />
        <Menu.Item onPress={() => navigateTo('ManageScheduledPayments')} title={t('MANAGE_SCHEDULED_PAYMENTS')} />
        <Menu.Item onPress={onAddPaymentMethodPress} title={t('ADD_PAYMENT_METHOD')} />
        <Menu.Item onPress={() => navigateTo('ManagePaymentMethods')} title={t('MANAGE_PAYMENT_METHODS')} />
        <Divider />
        <Menu.Item onPress={() => navigateTo('DeclinedTransactionInfo')} title={t('HELP_WITH_FAILED_PAYMENTS')} />
        <InfoDialog
          visible={isBlockedPaymentDialogOpen}
          onDismiss={hideBlockedPaymentDialog}
          title={t('CANNOT_PERFORM_PAYMENT')}
          content={t('NO_LONGER_LEASING_THIS_UNIT')}
        />
        <InfoDialog
          visible={isBlockedAddPaymentMethodDialogOpen}
          onDismiss={hideBlockedAddPaymentMethodDialog}
          title={t('CANNOT_ADD_PAYMENT_METHOD')}
          content={t('NO_LONGER_LEASING_THIS_UNIT_PMT_METHOD')}
        />
      </>
    );
  });
