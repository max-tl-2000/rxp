import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';

import { MaintenanceScreenNavigationProp } from '../types';
import { Screen, LoadingPictograph } from '../components';
import { t } from '../i18n/trans';
import { defaultTimeOut } from '../config';

interface Props {
  navigation: MaintenanceScreenNavigationProp;
}

export const CreateMaintenanceRequestInProgress = ({ navigation }: Props) =>
  useObserver(() => {
    const { maintenance } = useStores();
    const [canLeaveScreen, setCanLeaveScreen] = useState(false);

    useEffect(() => {
      const canLeaveTimeout = !canLeaveScreen && setTimeout(() => setCanLeaveScreen(true), defaultTimeOut);

      if (!maintenance.createMaintenanceRequestInProgress && canLeaveScreen) {
        if (!maintenance.createMaintenanceRequestFailed) navigation.goBack();
        else navigation.replace('CreateMaintenanceRequestFailed');
      }

      return () => {
        if (canLeaveTimeout) clearTimeout(canLeaveTimeout);
      };
    }, [maintenance.createMaintenanceRequestInProgress, canLeaveScreen]);

    return (
      <Screen title={t('CREATING_REQUEST')} mode="no-action" navigation={{}}>
        <LoadingPictograph message={t('CREATING_REQUEST_MSG')} />
      </Screen>
    );
  });
