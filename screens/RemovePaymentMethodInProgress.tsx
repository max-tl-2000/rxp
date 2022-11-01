import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';

import { PaymentsScreenNavigationProp } from '../types';
import { Screen, LoadingPictograph } from '../components';
import { t } from '../i18n/trans';
import { defaultTimeOut } from '../config';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const RemovePaymentMethodInProgress = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment, notification } = useStores();
    const [minWaitingTimeReached, setMinWaitingTimeReached] = useState(false);

    useEffect(() => {
      const minWaitingTimeoutHandle = setTimeout(() => setMinWaitingTimeReached(true), defaultTimeOut);

      return () => {
        clearTimeout(minWaitingTimeoutHandle);
      };
    }, []);

    useEffect(() => {
      if (!minWaitingTimeReached) return;

      if (payment.isRemovePaymentMethodError) {
        navigation.navigate('RemovePaymentMethodError');
      }

      if (!payment.isRemovePaymentMethodLoading && !payment.isRemovePaymentMethodError) {
        navigation.navigate('ManagePaymentMethods');
        notification.enqueue({
          userMessage: t('CREDIT_CARD_REMOVED_SUCCESSFULLY', {
            cardLastDigits: payment.lastFourDigitsRemoved,
          }),
        });
      }
    }, [payment.isRemovePaymentMethodLoading, minWaitingTimeReached]);

    return (
      <Screen title={t('REMOVING_PAYMENT_METHOD')} mode="no-action" navigation={{}}>
        <LoadingPictograph message={t('PLEASE_WAIT_WHILE_YOUR_PAYMENT_METHOD_IS_BEING_REMOVED')} />
      </Screen>
    );
  });
