import React from 'react';
import { useObserver } from 'mobx-react-lite';

import { useStores } from '../mobx/useStores';
import { t } from '../i18n/trans';
import { ErrorModal } from '../components';
import { PaymentsScreenNavigationProp } from '../types';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const MissingPaymentIntegrationError = ({ navigation }: Props) =>
  useObserver(() => {
    const { units } = useStores();
    return (
      <ErrorModal
        mode={units.hasMultipleUnits ? 'detail' : 'screen'}
        title={t('PAYMENTS')}
        messageTitle={t('CANT_USE_PAYMENTS_JUST_YET')}
        message={t('NO_PAYMENT_DATA_WITH_DETAILS')}
        navigation={navigation}
      />
    );
  });
