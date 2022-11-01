import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Portal, Button, Paragraph, Divider } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { PaymentInfo, ScheduledPayment } from '../mobx/stores/paymentTypes';
import { t } from '../i18n/trans';
import {
  Screen,
  FlatList,
  Dialog,
  ScheduledPaymentCard,
  LinearGradient,
  Text,
  Pictograph,
  InfoDialog,
} from '../components';
import { PaymentsScreenNavigationProp } from '../types';
import { useStores } from '../mobx/useStores';
import { getUnitName } from '../helpers/payments';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { useDialogState } from '../helpers/use-dialog-state';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      flex: 1,
    },
    defaultTextColor: {
      color: themeColors.onPrimary,
    },
    row: {
      flexDirection: 'row',
    },
    button: {
      backgroundColor: themeColors.backgroundSecondary,
      marginTop: 8,
    },
    marginHorizontal: {
      marginHorizontal: 16,
    },
    pageButtonContainer: {
      paddingBottom: 18,
      marginTop: 6,
      paddingHorizontal: 16,
    },
    maxWidth: {
      width: '100%',
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
    cardDivider: {
      height: 1,
      width: '100%',
      marginTop: 12,
    },
    schedulesListContainer: {
      paddingHorizontal: 16,
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateMessage: {
      color: themeColors.placeholder,
      textAlign: 'center',
      lineHeight: 20,
    },
    secondaryTextColor: {
      color: themeColors.secondary,
    },
  });

  return styles;
};

interface Props {
  navigation: PaymentsScreenNavigationProp;
}

export const ManageScheduledPayments = ({ navigation }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();

    const { payment } = useStores();
    const styles = createStyles(themeColors);
    const { selectedUnitPayment } = payment;
    const { isPastResident } = (selectedUnitPayment as PaymentInfo).unitUserInfo;

    const [scheduledPaymentToRemove, setScheduledPaymentToRemove] = useState<ScheduledPayment | undefined>(undefined);

    const unitName = getUnitName(selectedUnitPayment);

    const [isScheduledPmtBlockedDialogOpen, showScheduledPmtBlocked, hideScheduledPmtBlocked] = useDialogState();

    const onSchedulePaymentPress = () => {
      if (isPastResident) showScheduledPmtBlocked();
      else navigation.navigate('SchedulePayment');
    };

    const renderScheduledPaymentCard = ({ item }: { item: ScheduledPayment }) => {
      return (
        <View>
          <ScheduledPaymentCard item={item} />
          <View style={styles.row}>
            <Button
              mode="contained"
              style={styles.button}
              labelStyle={styles.defaultTextColor}
              onPress={() => setScheduledPaymentToRemove(item)}
            >
              {t('REMOVE')}
            </Button>
          </View>
          <Divider style={styles.cardDivider} />
        </View>
      );
    };

    const emptyList = (
      <View style={styles.emptyStateContainer}>
        <Pictograph type="question" />
        <Text style={styles.emptyStateMessage}>{t('NO_SCHEDULED_PAYMENTS')}</Text>
      </View>
    );

    return (
      <Screen
        title={`${t('SCHEDULES')} ${unitName ? `- ${unitName}` : ''}`}
        navigation={navigation}
        mode="detail"
        contentInSafeView
      >
        <View style={styles.content}>
          <FlatList
            data={payment.scheduledPayments}
            renderItem={renderScheduledPaymentCard}
            keyExtractor={(item: ScheduledPayment) => item.providerId?.toString()}
            ListEmptyComponent={emptyList}
            scrollEnabled
            style={styles.schedulesListContainer}
            contentContainerStyle={payment.scheduledPayments?.length ? null : styles.emptyStateContainer}
          />
          <LinearGradient />
          <View style={styles.pageButtonContainer}>
            <Button
              mode="contained"
              style={styles.maxWidth}
              labelStyle={styles.buttonLabel}
              onPress={onSchedulePaymentPress}
            >
              {t('SCHEDULE_A_PAYMENT')}
            </Button>
          </View>
        </View>

        <Portal>
          <Dialog visible={!!scheduledPaymentToRemove} onDismiss={() => setScheduledPaymentToRemove(undefined)}>
            <Dialog.Title>{t('REMOVE_SCHEDULED_PAYMENT')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{t('REMOVE_SCHEDULED_PAYMENT_MSG')}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                style={styles.marginHorizontal}
                labelStyle={styles.defaultTextColor}
                onPress={() => setScheduledPaymentToRemove(undefined)}
              >
                {t('CANCEL')}
              </Button>
              <Button
                labelStyle={styles.secondaryTextColor}
                onPress={() => {
                  payment.removeScheduledPayment(scheduledPaymentToRemove?.providerId);
                  setScheduledPaymentToRemove(undefined);
                }}
              >
                {t('YES_REMOVE')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <InfoDialog
          visible={isScheduledPmtBlockedDialogOpen}
          onDismiss={hideScheduledPmtBlocked}
          title={t('CANNOT_PERFORM_PAYMENT')}
          content={t('NO_LONGER_LEASING_THIS_UNIT')}
        />
      </Screen>
    );
  });
