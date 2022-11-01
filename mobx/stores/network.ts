/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import NetInfo, { NetInfoState, NetInfoConnectedStates } from '@react-native-community/netinfo';
import { observable, action, computed } from 'mobx';

import { NetInfoConfig, isWeb } from '../../config';

export class Network {
  constructor() {
    if (!isWeb) {
      NetInfo.configure(NetInfoConfig);
      NetInfo.fetch().then(this.setState);
      NetInfo.addEventListener(this.setState);
    }
  }

  @observable
  state: NetInfoState = {
    type: 'cellular',
    isConnected: true,
    isInternetReachable: true,
    details: {
      isConnectionExpensive: false,
      cellularGeneration: null,
      carrier: null,
    },
  } as NetInfoConnectedStates;

  /**
   * For now we only need to know if the device has internet,
   * so we update the status only when that value changes.
   */
  @action
  setState = (state: NetInfoState) => {
    if (state.isInternetReachable !== null && this.state.isInternetReachable !== state.isInternetReachable) {
      this.state = state;
    }
  };

  @computed
  get hasInternet() {
    return this.state.isInternetReachable;
  }

  get isConnected() {
    return this.state.isConnected;
  }
}
