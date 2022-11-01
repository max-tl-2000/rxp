import React, { useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';

import { PaymentsScreenNavigationProp } from '../types';
import { Screen, LoadingPictograph } from '../components';
import { t } from '../i18n/trans';
import { paymentMethodTimeOut } from '../config';
import { logger } from '../helpers/logger';

interface Props {
  navigation: PaymentsScreenNavigationProp;
  route?: { params?: { dataToLog?: object; redirectToManagePaymentMethods?: boolean } };
}

export const AddPaymentMethodInProgress = ({ navigation, route }: Props) =>
  useObserver(() => {
    const { payment } = useStores();

    let paymentReceivedTimeout: NodeJS.Timeout;

    useEffect(() => {
      if (payment.isNewPaymentMethodReceived && route?.params?.redirectToManagePaymentMethods) {
        navigation.replace('ManagePaymentMethods');
      }
      if (payment.isNewPaymentMethodReceived && !route?.params?.redirectToManagePaymentMethods) {
        payment.setNewPaymentMethodReceived(false);
        navigation.goBack();
      }

      paymentReceivedTimeout = setTimeout(() => {
        if (payment.isNewPaymentMethodReceived && route?.params?.redirectToManagePaymentMethods) {
          navigation.replace('ManagePaymentMethods');
        }
        if (payment.isNewPaymentMethodReceived && !route?.params?.redirectToManagePaymentMethods) {
          payment.setNewPaymentMethodReceived(false);
          navigation.goBack();
        } else {
          logger.error('create payment method timeout exceeded', route?.params?.dataToLog);
          navigation.replace('AddPaymentMethodError');
        }
      }, paymentMethodTimeOut);

      return () => {
        clearTimeout(paymentReceivedTimeout);
      };
    }, [payment.isNewPaymentMethodReceived]);

    return (
      <Screen title={t('ADDING_PAYMENT_METHOD')} mode="no-action" navigation={{}}>
        <LoadingPictograph message={t('ADDING_PAYMENT_METHOD_MSG')} />
      </Screen>
    );
  });
