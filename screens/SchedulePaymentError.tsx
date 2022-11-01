import React from 'react';
import { useObserver } from 'mobx-react-lite';

import { useStores } from '../mobx/useStores';
import { t } from '../i18n/trans';
import { ErrorModal } from '../components';
import { PaymentsScreenNavigationProp } from '../types';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const SchedulePaymentError = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment } = useStores();

    return (
      <ErrorModal
        title={t('ERROR_SCHEDULING_PAYMENT')}
        message={t('GENERIC_ERROR_MESSAGE')}
        messageTitle={t('SOMETHING_WENT_WRONG')}
        navigation={navigation}
        action={() => {
          payment.setSchedulePaymentFailed(false);
          navigation.replace('SchedulePayment');
        }}
        onClose={() => payment.setSchedulePaymentFailed(false)}
      />
    );
  });
