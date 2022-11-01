import React from 'react';
import { useObserver } from 'mobx-react-lite';

import { useStores } from '../mobx/useStores';
import { t } from '../i18n/trans';
import { ErrorModal } from '../components';
import { MaintenanceScreenNavigationProp } from '../types';

interface Props {
  navigation: MaintenanceScreenNavigationProp;
}

export const CreateMaintenanceRequestFailed = ({ navigation }: Props) =>
  useObserver(() => {
    const { maintenance } = useStores();

    return (
      <ErrorModal
        title={
          maintenance.isMaintenanceTypeRequestFinished ? t('ERROR_LOADING_MAINTENANCE') : t('ERROR_CREATING_REQUEST')
        }
        message={t('ERROR_CREATING_REQUEST_MSG')}
        messageTitle={t('SOMETHING_WENT_WRONG')}
        navigation={navigation}
        action={() => {
          maintenance.setCreateMaintenanceRequestFailed(false);
          maintenance.isMaintenanceTypeRequestFinished
            ? navigation.goBack()
            : navigation.replace('CreateMaintenanceRequest', { shouldLoadPreviousFormData: true });
        }}
        onClose={() => maintenance.setCreateMaintenanceRequestFailed(false)}
      />
    );
  });
