import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { logger } from '../helpers/logger';
import { useStores } from '../mobx/useStores';

import { PaymentsScreenNavigationProp } from '../types';
import { Screen, LoadingPictograph } from '../components';
import { t } from '../i18n/trans';
import { defaultTimeOut, NetInfoConfig } from '../config';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const SchedulePaymentInProgress = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment, notification } = useStores();
    const [minWaitingTimeReached, setMinWaitingTimeReached] = useState(false);
    const [timeoutReached, setTimeoutReached] = useState(false);

    useEffect(() => {
      const minWaitingTimeoutHandle = setTimeout(() => setMinWaitingTimeReached(true), defaultTimeOut);
      const timeoutHandle = setTimeout(() => setTimeoutReached(true), NetInfoConfig.reachabilityRequestTimeout);

      return () => {
        clearTimeout(timeoutHandle);
        clearTimeout(minWaitingTimeoutHandle);
      };
    }, []);

    useEffect(() => {
      if (timeoutReached) {
        logger.warn(`timeout of ${NetInfoConfig.reachabilityRequestTimeout} reached while waiting to schedule payment`);
        navigation.navigate('SchedulePaymentError');
        payment.setSchedulePaymentFailed(true);
      }

      if (!minWaitingTimeReached) return;

      if (payment.newPaymentWasScheduled) {
        navigation.navigate('UnitPayments');
        payment.setNewPaymentWasScheduled(false);
        notification.enqueue({ userMessage: t('PAYMENT_SCHEDULED_SUCCESSFULLY') });
      }
    }, [payment.newPaymentWasScheduled, minWaitingTimeReached, timeoutReached]);

    return (
      <Screen title={t('SCHEDULING_PAYMENT')} mode="no-action" navigation={{}}>
        <LoadingPictograph message={t('PLEASE_WAIT_WHILE_YOUR_PAYMENT_IS_BEING_SCHEDULED')} />
      </Screen>
    );
  });
