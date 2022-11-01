import React, { useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';
import { PaymentsScreenNavigationProp } from '../types';
import { Screen, WebView } from '../components';
import { t } from '../i18n/trans';
import { logger } from '../helpers/logger';

interface Props {
  navigation: PaymentsScreenNavigationProp;
  route?: { params?: { redirectToManagePaymentMethods?: boolean } };
}

export const AddPaymentMethod = ({ route, navigation }: Props) =>
  useObserver(() => {
    const { payment, auth, userSettings } = useStores();
    useEffect(() => {
      payment.initiatePaymentMethod();
    }, []);

    useEffect(() => {
      if (payment.addPaymentMethodError) {
        navigation.replace('AddPaymentMethodError');
      }
    }, [payment.addPaymentMethodError]);

    const handleWebViewAction = (action: string, payload?: { userId: string; paymentMethodId: string }) => {
      const dataToLog = {
        userId: payload?.userId || auth?.user?.id,
        tenantName: userSettings?.propertySelected?.tenantName,
        paymentMethodId: payload?.paymentMethodId,
      };
      switch (action) {
        case 'transactionRedirected':
          navigation.replace('AddPaymentMethodInProgress', {
            dataToLog,
            redirectToManagePaymentMethods: route?.params?.redirectToManagePaymentMethods,
          });
          break;
        case 'transactionCanceled':
          logger.info('create payment method transaction was canceled', dataToLog);
          navigation.replace('AddPaymentMethodError');
          break;
        default:
          logger.error('unexpected action in the redirect at creating payment method', dataToLog);
          // TODO: It's ok to redirect to the error page if it doesn't match any?
          navigation.replace('AddPaymentMethodError');
      }
    };

    return (
      <Screen title={t('ADD_PAYMENT_METHOD')} navigation={navigation} mode="modal">
        {navigation.isFocused() && (
          <WebView title={t('ADD_PAYMENT_METHOD')} uri={payment.paymentMethodLink} onAction={handleWebViewAction} />
        )}
      </Screen>
    );
  });
