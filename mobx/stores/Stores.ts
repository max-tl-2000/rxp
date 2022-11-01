/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action } from 'mobx';
import { Auth } from './auth';
import { Posts } from './post';
import { UserSettings } from './userSettings';
import { Notification } from './notification';
import { Settings } from './settings';

import { getScreenSizeStore, Screen } from './screenSize';
import { Payment } from './payment';
import { Network } from './network';
import { Messages } from './message';
import { Unsubscription } from './unsubscription';
import { UserIndicators } from './userIndicators';
import { BrandingContext } from './brandingContext';
import { Maintenance } from './maintenance';
import { Units } from './units';

export class Stores {
  @observable
  notification: Notification;

  @observable
  auth: Auth;

  @observable
  settings: Settings;

  @observable
  userSettings: UserSettings;

  @observable
  post: Posts;

  @observable
  payment: Payment;

  @observable
  units: Units;

  @observable
  screenSize: Screen;

  @observable
  network: Network;

  @observable
  messages: Messages;

  @observable
  unsubscription: Unsubscription;

  @observable
  userIndicators: UserIndicators;

  @observable
  brandingContext: BrandingContext;

  @observable
  maintenance: Maintenance;

  @action
  resetStores() {
    // reset other stores here
    this.post.resetStore();
    this.messages.resetStore();
    this.payment.resetStore();
  }

  constructor() {
    const notification = new Notification();
    const settings = new Settings(notification);
    const userSettings = new UserSettings(settings, notification);
    const userIndicators = new UserIndicators(userSettings, settings);
    const unsubscription = new Unsubscription();
    const units = new Units(userSettings);

    const auth = new Auth(settings, notification, userSettings);

    this.post = new Posts(userSettings, notification);
    this.payment = new Payment(userSettings, notification, units, userIndicators);
    this.screenSize = getScreenSizeStore();
    this.network = new Network();
    this.messages = new Messages(userSettings, notification, userIndicators);
    this.brandingContext = new BrandingContext({ settings, userSettings });
    this.maintenance = new Maintenance(userSettings, notification);

    this.notification = notification;
    this.auth = auth;
    this.units = units;
    this.unsubscription = unsubscription;
    this.userIndicators = userIndicators;
    this.settings = settings;
    this.userSettings = userSettings;
  }
}
