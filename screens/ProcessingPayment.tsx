import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { reaction, IReactionPublic } from 'mobx';

import { t } from '../i18n/trans';
import { Screen, LoadingPictograph } from '../components';
import { PaymentsScreenNavigationProp } from '../types';
import { useStores } from '../mobx/useStores';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const ProcessingPayment = ({ navigation }: Props) =>
  useObserver(() => {
    const { units, payment } = useStores();

    // TODO: try to type 'e' - right now its a really long generic
    // (e: EventArg<Extract<EventName, string>, EventMap[EventName]['canPreventDefault'], EventMap[EventName]['data']>)
    const onBeforeNavigation = (e: any) => {
      if (!payment.isPaymentInProgress) return;
      e.preventDefault();
    };

    const [reactionDisposer, setReactionDisposer] = useState<IReactionPublic>();

    const onFocus = () => {
      reaction(
        () => payment.isPaymentInProgress,
        (inProgress, disposer) => {
          setReactionDisposer(disposer);
          if (!inProgress) {
            if (payment.isPaymentSuccessful)
              units.hasMultipleUnits ? navigation.navigate('UnitSelector') : navigation.navigate('UnitPayments');
            if (payment.hasPaymentFailed) navigation.replace('PaymentError');
            disposer.dispose();
          }
        },
      );
    };

    useEffect(() => {
      navigation.addListener('beforeRemove', onBeforeNavigation);
      navigation.addListener('focus', onFocus);

      return () => {
        navigation.removeListener('beforeRemove', onBeforeNavigation);
        navigation.removeListener('focus', onFocus);
        if (reactionDisposer) reactionDisposer.dispose();
      };
    }, []);

    return (
      <Screen title={t('PROCESSING_PAYMENT')} navigation={navigation} mode="no-action">
        <LoadingPictograph message={t('PLEASE_WAIT_WHILE_YOUR_PAYMENT_IS_BEING_PROCESSED')} />
      </Screen>
    );
  });
