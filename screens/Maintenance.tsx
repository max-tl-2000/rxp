import React, { useEffect } from 'react';
import { StyleSheet, View, ListRenderItemInfo } from 'react-native';
import { Button } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { getUnitName } from '../helpers/units';
import { MaintenanceScreenNavigationProp } from '../types';
import {
  Screen,
  MaintenanceCard,
  Text,
  Title,
  Loading,
  LinearGradient,
  FlatList,
  Pictograph,
  InfoDialog,
} from '../components';
import { useStores } from '../mobx/useStores';
import { Ticket } from '../mobx/stores/maintenanceTypes';
import { t } from '../i18n/trans';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { useDialogState } from '../helpers/use-dialog-state';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      padding: 16,
    },
    errorContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
      marginBottom: 120,
    },
    errorText: {
      marginBottom: 20,
      textAlign: 'center',
    },
    noMarginBottom: {
      marginBottom: 0,
    },
    marginStyle: {
      marginBottom: 12,
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateMessage: {
      color: themeColors.placeholder,
      lineHeight: 20,
    },
    createRequestContainer: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 18,
      marginTop: 6,
    },
    createRequestButton: {
      width: '100%',
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
  });

  return styles;
};

interface Props {
  navigation: MaintenanceScreenNavigationProp;
}

export const Maintenance = ({ navigation }: Props) =>
  useObserver(() => {
    const { maintenance: maintenanceStore, userSettings, units: unitsStore } = useStores();
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

    useEffect(() => {
      maintenanceStore.getMaintenanceData();
    }, [userSettings.selectedPropertyId]);

    useEffect(() => {
      if (maintenanceStore.isMaintenanceTypeRequestFinished) {
        if (maintenanceStore.createMaintenanceRequestFailed) {
          navigation.navigate('CreateMaintenanceRequestFailed');
        } else navigation.navigate('CreateMaintenanceRequest');
      }
    }, [maintenanceStore.isMaintenanceTypeRequestFinished]);

    const onPressSelectedMaintenanceCard = (selectedMaintenanceTicket: Ticket) => {
      maintenanceStore.setSelectedMaintenanceTicket(selectedMaintenanceTicket);
      navigation.navigate('MaintenanceTicket');
    };

    const [
      isCannotCreateRequestDialogOpen,
      showCannotCreateRequestDialog,
      hideCannotCreateRequestDialog,
    ] = useDialogState();

    const { hasMultipleUnits, unitsInfo, activeUnits } = unitsStore;

    const { enhancedAndSortedMaintenanceInfos } = maintenanceStore;

    const renderItem = ({ item, index }: ListRenderItemInfo<Ticket>) => {
      const unit = unitsInfo.find(u => u.id === item.inventoryId);
      const unitName = getUnitName(unit);
      const isLastItem = index === enhancedAndSortedMaintenanceInfos.length - 1;
      return (
        <MaintenanceCard
          maintenanceTicket={item}
          unitName={unitName}
          showUnitName={hasMultipleUnits}
          isLastItem={isLastItem}
          onPress={onPressSelectedMaintenanceCard}
        />
      );
    };

    const renderError = () => (
      <View style={styles.errorContent}>
        <Pictograph type="exhausted" />
        <Title>{t('SORRY')}</Title>
        <Title style={styles.marginStyle}>{t('CANNOT_USE_MAINTENANCE')}</Title>
        <Text style={[styles.errorText, styles.noMarginBottom]}>{t('NO_MAINTENANCE_DATA')}</Text>
        <Text style={styles.errorText}>{t('THIS_MAY_HAPPEND')}</Text>
        <Text style={styles.errorText}>{t('RETRY_LATER_OR_CONTACT_PROPERTY_MAINTENANCE')}</Text>
      </View>
    );

    const emptyList = (
      <View style={styles.emptyStateContainer}>
        <Pictograph type="question" />
        <Text style={styles.emptyStateMessage}>{t('NO_MAINTENANCE_DATA_LINE1')}</Text>
        <Text style={styles.emptyStateMessage}>{t('NO_MAINTENANCE_DATA_LINE2')}</Text>
      </View>
    );

    const handleCreateRequest = () => {
      if (activeUnits.length) {
        maintenanceStore.getMaintenanceTypes();
      } else showCannotCreateRequestDialog();
    };

    const renderDetails = () => (
      <>
        <FlatList
          contentContainerStyle={enhancedAndSortedMaintenanceInfos.length ? styles.content : styles.emptyStateContainer}
          data={enhancedAndSortedMaintenanceInfos}
          renderItem={renderItem}
          ListEmptyComponent={emptyList}
          scrollEnabled
          keyExtractor={(item: Ticket, index: number) => item.inventoryId + index}
        />
        <View style={styles.createRequestContainer}>
          <LinearGradient />
          <Button
            mode="contained"
            style={styles.createRequestButton}
            labelStyle={styles.buttonLabel}
            onPress={() => handleCreateRequest()}
          >
            {t('CREATE_REQUEST')}
          </Button>
        </View>
      </>
    );

    const renderContent = () => (maintenanceStore.isMaintenanceAvailable ? renderDetails() : renderError());

    return (
      <Screen title="Maintenance" navigation={navigation} contentInSafeView>
        {maintenanceStore.isMaintenanceLoading || maintenanceStore.isMaintenanceCreationLoading ? (
          <Loading />
        ) : (
          renderContent()
        )}
        <InfoDialog
          visible={isCannotCreateRequestDialogOpen}
          onDismiss={hideCannotCreateRequestDialog}
          title={t('CANNOT_CREATE_REQUEST')}
          content={t('CANNOT_CREATE_REQUEST_MSG')}
        />
      </Screen>
    );
  });
