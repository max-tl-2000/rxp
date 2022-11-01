import React from 'react';
import { useObserver } from 'mobx-react-lite';

import { PaymentProcessingStatus } from '../mobx/stores/paymentTypes';
import { t } from '../i18n/trans';
import { ErrorModal, BalanceInfo } from '../components';
import { useStores } from '../mobx/useStores';
import { PaymentsScreenNavigationProp } from '../types';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const PaymentError = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment } = useStores();
    const { paymentProcessingStatus } = payment;

    return (
      <ErrorModal
        title={t('ERROR_PROCESSING_PAYMENT')}
        message={
          paymentProcessingStatus === PaymentProcessingStatus.Expired
            ? t('PAYMENT_METHOD_EXPIRED')
            : t('PAYMENT_PROCESSING_FAILED')
        }
        navigation={navigation}
        action={() => navigation.navigate('MakePayment')}
      >
        <BalanceInfo />
      </ErrorModal>
    );
  });
