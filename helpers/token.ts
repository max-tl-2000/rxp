/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { reaction } from 'mobx';

type settings = {
  isEmailTokenExpired: boolean;
  loginFlowinitiatorSource: string;
};

export const onEmailTokenExpired = (settings: settings, callback: () => void): void => {
  const disposer = reaction(
    () => {
      const { isEmailTokenExpired } = settings;
      return { isEmailTokenExpired };
    },
    ({ isEmailTokenExpired }) => {
      const { loginFlowinitiatorSource } = settings;
      if (isEmailTokenExpired && loginFlowinitiatorSource === 'auth/resetPassword') {
        callback();
        disposer?.();
      }
    },
  );
};
