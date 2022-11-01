/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, computed, runInAction } from 'mobx';

import debounce from 'lodash/debounce';
import { ISignInForm, createSignInForm, ISignInFormData } from '../forms/login-form';
import { ISignUpForm, createSignUpForm, ISignUpFormData } from '../forms/signUp-form';
import { makeRequest, mediator, RequestParams } from '../../network/helpers';
import { authServer, residentServer, appId, rxpApiToken } from '../../config';
import { Settings } from './settings';
import { Notification } from './notification';
import { getUserProperties, userSignIn } from '../../services/user-service';
import { FAILED_TO_FETCH } from '../../constants/messages';
import { UserSettings } from './userSettings';
import { User, LoginStatus } from './authTypes';
import { syncStorage } from '../../helpers/sync-storage/sync-storage';
import { logger } from '../../helpers/logger';
import { ObservablePromiseState, observePromise, ErrorResponse } from '../helpers/ObservablePromiseState';
import { ACCOUNT_BLOCKED, EMAIL_AND_PASSWORD_MISMATCH } from './authErrorTokens';
import { t } from '../../i18n/trans';

export type OnBeforeLogoutCallback = {
  (): void;
};

export class Auth {
  notification: Notification;

  settings: Settings;

  userSettings: UserSettings;

  onBeforeLogout?: OnBeforeLogoutCallback;

  constructor(settings: Settings, notification: Notification, userSettings: UserSettings) {
    this.settings = settings;
    this.notification = notification;
    this.userSettings = userSettings;
    mediator().subscribe(
      'user:unauthorized',
      debounce(this.signOut, 300, {
        leading: true,
      }),
    );
  }

  @observable
  user: User | undefined;

  @observable
  signInInProgress = false;

  @observable
  status: LoginStatus | undefined;

  @computed
  get isSignedIn(): boolean {
    return !!this.user?.id;
  }

  @action
  setUser = (user: User | undefined): void => {
    this.user = user;
  };

  @action
  setSignInProgress = ({ inProgress }: { inProgress: boolean }): void => {
    this.signInInProgress = inProgress;
  };

  @action
  setStatus = (status: LoginStatus): void => {
    this.status = status;
  };

  @action
  clearStatus = () => {
    this.status = undefined;
  };

  @action
  resetStatus = () => {
    this.userSignInObservablePromise = undefined;
  };

  @action
  restoreUser = async (userData: User) => {
    if (!userData) return; // this might need to throw in case of login, but not when restoring the user from localStorage

    const { email, fullName, preferredName, id, authToken } = userData;
    if (!email || !id || !authToken) return;

    const { emailToken, propertyId, tenantName, tokenTenantName, tokenPropertyId } = this.settings;

    const { userSettingsError, userSettingsResponse } = await getUserProperties(
      {
        emailToken,
        propertyId: propertyId || tokenPropertyId,
        tenantName: tenantName || tokenTenantName,
        appId,
      },
      authToken,
    );

    runInAction(() => {
      // TODO: This error occurs after user password validation or could also after login on deepLinkHandling
      // and the statuses on updateStatusWithTheGivenError are not valid for that scenarios
      // the errors in the userSettingsError are not displayed to the user yet
      if (userSettingsError) {
        this.updateStatusWithTheGivenError(userSettingsError);
        return;
      }

      const user: User = {
        authToken,
        email,
        fullName,
        preferredName,
        id,
      };

      this.setUser(user);

      syncStorage.fields.userData = user;

      this.userSettings.setUserSettingResponse(userSettingsResponse);
    });
  };

  @observable
  userSignInObservablePromise?: ObservablePromiseState;

  @computed
  get loginInProgress() {
    return this.userSignInObservablePromise?.loading;
  }

  @computed
  get loginInProgressOrLoginSuccess() {
    return this.loginInProgress || this.loginSuccess;
  }

  @computed
  get loginSuccess() {
    return this.userSignInObservablePromise?.success;
  }

  @computed
  get loginError(): ErrorResponse | undefined {
    return this.userSignInObservablePromise?.error;
  }

  @computed
  get loginStateAccountBlocked() {
    return this.loginError?.token === ACCOUNT_BLOCKED;
  }

  @computed
  get loginStateWrongPassword() {
    return this.loginError?.token === EMAIL_AND_PASSWORD_MISMATCH;
  }

  @action
  signIn = async (
    email: string,
    password: string,
    _name_: string,
    { isEventFromView = true }: { isEventFromView?: boolean } = {},
  ): Promise<void> => {
    this.userSignInObservablePromise = observePromise(() => userSignIn({ email, password, _name_ }));

    await this.userSignInObservablePromise.promise;

    if (!this.userSignInObservablePromise.success) {
      if (this.userSignInObservablePromise.promiseError?.message === FAILED_TO_FETCH)
        this.notification.enqueue({ userMessage: t('GENERIC_ERROR_MESSAGE'), debugMessage: 'Error at signIn' });

      return;
    }

    runInAction(() => {
      const { user, token: authToken } = this.userSignInObservablePromise?.responseData;

      const userData: User = {
        // TODO: should the localStorage only keep the id and token??
        // I think it should be better to have a method that will perform
        // login using the user.id and token (instead of the password)
        // With the current approach if the user changes its name
        // he or she will have to logout/login to obtain new up to date data
        // if we only keep the id then a simple reload should do the trick
        authToken,
        email: user?.email,
        fullName: user?.fullName,
        preferredName: user?.preferredName,
        id: user?.id,
      };

      this.restoreUser(userData);

      this.signInForm.clearPassword();
      // Reset status for userSignInObservablePromise after signIn when the event doesn't come from the view
      !isEventFromView && this.resetStatus();
    });
  };

  @action
  resetPassword = async (email: string, password: string, _name_: string): Promise<void> => {
    const { error } = await makeRequest({
      serverUrl: authServer,
      path: '/commonUser/changePassword',
      method: 'POST',
      body: { email, password, emailToken: this.settings.emailToken, _name_ },
      onStatusChanged: this.setSignInProgress,
      headers: { 'rxp-api-token': rxpApiToken },
    } as RequestParams);

    runInAction(async () => {
      if (error) {
        this.updateStatusWithTheGivenError(error);
        return;
      }

      this.signInForm.clearPassword();

      const { tokenPropertyId, tokenTenantName } = this.settings;

      // TODO: handle the error case to sent reset password confirmation
      // TODO: handle the loading state to sent reset password confirmation
      await makeRequest({
        serverUrl: authServer,
        path: '/commonUser/sendResetPassword',
        method: 'POST',
        body: {
          emailAddress: email,
          propertyId: tokenPropertyId,
          tenantName: tokenTenantName,
          appId,
          appName: this.settings.applicationName,
          isConfirmation: true,
        },
        headers: { 'rxp-api-token': rxpApiToken },
      } as RequestParams);

      await this.signIn(email, password, _name_, { isEventFromView: false });
    });
  };

  @observable
  resetPasswordInProgress = false;

  @action
  setResetPasswordProgressFlag = (inProgress: boolean) => {
    this.resetPasswordInProgress = inProgress;
  };

  @action
  sendResetPasswordEmail = async ({
    email: emailAddress,
    _name_,
  }: {
    email: string;
    _name_: string;
  }): Promise<void> => {
    const { tokenPropertyId, tokenTenantName } = this.settings;

    const { error } = await makeRequest({
      // TODO: this pattern leads to a lot of repeated code
      // Move this to use the request helper as suggested by Christophe
      // to avoid code duplication
      onStatusChanged: ({ inProgress }: { inProgress: boolean }) => {
        this.setResetPasswordProgressFlag(inProgress);
      },
      serverUrl: authServer,
      path: '/commonUser/sendResetPassword/',
      method: 'POST',
      body: {
        _name_,
        emailAddress,
        propertyId: tokenPropertyId,
        tenantName: tokenTenantName,
        appId,
        appName: this.settings.applicationName,
      },
      headers: { 'rxp-api-token': rxpApiToken },
    } as RequestParams);

    runInAction(async () => {
      if (error) {
        this.updateStatusWithTheGivenError(error);
      }
    });
  };

  updateStatusWithTheGivenError = (error: { token: string; message: string }) => {
    if (error.token === 'EMAIL_AND_PASSWORD_MISMATCH') {
      this.setStatus(LoginStatus.wrongCredentials);
      return;
    }

    if (error.token === 'ACCOUNT_BLOCKED') {
      this.setStatus(LoginStatus.accountBlocked);
      return;
    }

    if (error.token === 'USER_IS_PAST_RESIDENT') {
      this.setStatus(LoginStatus.userIsPastResident);
      return;
    }

    this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at login' });
    logger.error('error at login', error);
  };

  @action
  signOut = () => {
    if (!this.isSignedIn) {
      // nothing to do the user is already signed out
      // this is the actual fix for all the loops we had
      return;
    }
    if (this.onBeforeLogout) {
      this.onBeforeLogout();
    }
    this.setUser(undefined);
  };

  private actualSignInForm?: ISignInForm;

  @action
  signUp = async (email: string, password: string, _name_: string): Promise<void> => {
    const { error } = await makeRequest({
      serverUrl: authServer,
      path: '/commonUser/changePassword',
      method: 'POST',
      body: { email, password, emailToken: this.settings.emailToken, _name_ },
      onStatusChanged: this.setSignInProgress,
      headers: { 'rxp-api-token': rxpApiToken },
    } as RequestParams);

    await runInAction(async () => {
      if (error) {
        this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at signUp' });
        logger.error('error at signUp', error);
        return;
      }

      await this.signIn(email, password, _name_, { isEventFromView: false });
    });
  };

  getDeepLinkUrl = (redirectionPath: string, getApp: boolean): string =>
    `${residentServer}/resident/api/deepLink?emailToken=${this.settings.emailToken}&getApp=${getApp}&redirectionPath=${redirectionPath}`;

  get signInForm() {
    if (!this.actualSignInForm) {
      const initialState = {
        email: this.settings.tokenEmail ?? '',
        _name_: '',
      };
      this.actualSignInForm = createSignInForm(initialState as ISignInFormData);
    }
    return this.actualSignInForm;
  }

  private actualSignUpForm?: ISignUpForm;

  get signUpForm() {
    if (!this.actualSignUpForm) {
      const initialState = { email: this.settings.tokenEmail ?? '', _name_: '' };
      this.actualSignUpForm = createSignUpForm(initialState as ISignUpFormData);
    }

    return this.actualSignUpForm;
  }
}
