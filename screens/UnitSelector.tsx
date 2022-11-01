import React, { useEffect } from 'react';
import { ListRenderItemInfo, StyleSheet, View, TextStyle } from 'react-native';
import { useObserver } from 'mobx-react-lite';

import { t } from '../i18n/trans';
import { PaymentsScreenNavigationProp } from '../types';
import { Screen, PaymentCard, FlatList, Text, LoadingPictograph, PaymentErrorComponent } from '../components';
import { useStores } from '../mobx/useStores';
import { PaymentInfo } from '../mobx/stores/paymentTypes';
import { fontDefinition } from '../helpers/fonts';

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

const createStyles = () => {
  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      paddingTop: 8,
      paddingHorizontal: 12,
    },
    title: {
      ...(fontDefinition.medium as TextStyle),
      lineHeight: 20,
      letterSpacing: 0.8,
      paddingHorizontal: 4,
      paddingVertical: 8,
    },
    listStyle: {
      paddingBottom: 16,
    },
  });
  return styles;
};

export const UnitSelector = ({ navigation }: Props) =>
  useObserver(() => {
    const { payment: paymentsStore, notification, userSettings } = useStores();
    const { paymentInfoItems, isPaymentSuccessful, dismissPaymentStatus, getPaymentInfo } = paymentsStore;

    useEffect(() => {
      getPaymentInfo();
    }, [userSettings.selectedPropertyId]);

    useEffect(() => {
      if (isPaymentSuccessful) {
        notification.enqueue({ userMessage: t('PAYMENT_SUCCESSFUL') }, dismissPaymentStatus);
      }
    }, [isPaymentSuccessful]);

    const styles = createStyles();

    const onPressSelectedUnitCard = (selectedPaymentInfo: PaymentInfo) => {
      const { integrationIdIsMissing } = selectedPaymentInfo.unitUserInfo;
      if (integrationIdIsMissing) {
        navigation.navigate('MissingPaymentIntegrationError');
      } else {
        paymentsStore.setSelectedUnitPayment(selectedPaymentInfo);
        navigation.navigate('UnitPayments', {
          shouldNotDisplayPaymentNotification: true,
          shouldNotLoadPaymentInfo: true,
        });
      }
    };

    const renderItem = ({ item }: ListRenderItemInfo<PaymentInfo>) => (
      <PaymentCard paymentInfo={item} onPress={onPressSelectedUnitCard} />
    );

    const renderDetails = () => (
      <View style={styles.wrapper}>
        <FlatList
          ListHeaderComponent={<Text style={styles.title}>{t('UNITS_RENTED')}</Text>}
          data={paymentInfoItems}
          style={styles.listStyle}
          renderItem={renderItem}
          scrollEnabled
          keyExtractor={(item: PaymentInfo, index: number) => item.unitUserInfo.fullyQualifiedName + index}
        />
      </View>
    );

    const renderContent = () =>
      paymentInfoItems.length ? renderDetails() : <PaymentErrorComponent token={paymentsStore.errorToken} />;

    return (
      <Screen title={t('PAYMENTS')} navigation={navigation}>
        {paymentsStore.isPaymentInfoLoading || !paymentsStore.isPaymentInfoLoaded ? (
          <LoadingPictograph message={t('PAYMENT_LOADING_MSG')} />
        ) : (
          renderContent()
        )}
      </Screen>
    );
  });
