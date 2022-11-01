import React from 'react';
import { useObserver } from 'mobx-react-lite';

import { useStores } from '../mobx/useStores';
import { t } from '../i18n/trans';
import { ErrorModal } from '../components';
import { PaymentsScreenNavigationProp } from '../types';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const RemovePaymentMethodError = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment } = useStores();

    return (
      <ErrorModal
        title={t('ERROR_REMOVING_METHOD')}
        message={t('ERROR_REMOVING_METHOD_MESSAGE')}
        messageTitle={t('SOMETHING_WENT_WRONG')}
        backScreen="ManagePaymentMethods"
        navigation={navigation}
        action={() => {
          payment.setRemovePaymentMethodError(false);
          navigation.replace('ManagePaymentMethods');
        }}
        onClose={() => {
          payment.setRemovePaymentMethodError(false);
        }}
      />
    );
  });
