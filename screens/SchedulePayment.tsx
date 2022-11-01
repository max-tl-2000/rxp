import React, { useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';
import { PaymentsScreenNavigationProp } from '../types';
import { Screen, WebView } from '../components';
import { t } from '../i18n/trans';
import { logger } from '../helpers/logger';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const SchedulePayment = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment } = useStores();

    useEffect(() => {
      payment.initiateScheduledPayment();
    }, []);

    useEffect(() => {
      if (payment.schedulePaymentFailed) navigation.replace('SchedulePaymentError');
    }, [payment.schedulePaymentFailed]);

    const handleWebViewAction = (action: string) => {
      switch (action) {
        case 'transactionRedirected':
          navigation.replace('SchedulePaymentInProgress');
          return;
        case 'transactionCanceled':
          navigation.replace('SchedulePaymentError');
          return;
        default:
          // TODO: It's ok to redirect to the error page if it doesn't match any?
          logger.warn('unexpected web view action for schedule payments', action);
          navigation.replace('SchedulePaymentError');
      }
    };

    return (
      <Screen title={t('SCHEDULE_A_PAYMENT')} navigation={navigation} mode="modal">
        {navigation.isFocused() && (
          <WebView title={t('SCHEDULE_A_PAYMENT')} uri={payment.schedulePaymentLink} onAction={handleWebViewAction} />
        )}
      </Screen>
    );
  });
