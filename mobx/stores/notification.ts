/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action } from 'mobx';
import { duration } from '../../constants/duration';

export type InteractiveMessage = {
  severity?: 'info' | 'warning' | 'error';
  text: string;
  actions: {
    label: string;
    action: () => { navigationRoute?: string; shouldDismiss?: boolean };
  }[];
};

export type Message = {
  userMessage: string;
  debugMessage?: string;
};

const noInteractiveMessagesScreens = ['DeclinedTransactionInfo'];

export class Notification {
  messages = new Set<{ message: Message; onDismiss?: Function }>();

  @observable
  message?: Message;

  @observable
  onDismiss?: Function;

  @observable
  shouldShowSplashScreen = false;

  @action
  showSplashScreen = () => {
    this.shouldShowSplashScreen = true;
  };

  @action
  hideSplashScreen = () => {
    this.shouldShowSplashScreen = false;
  };

  @action
  enqueue = (message: Message, onDismiss?: Function) => {
    this.messages.add({ message, onDismiss });

    if (!this.message) this.dequeue();
  };

  @action
  dequeue = () => {
    const { value, done } = this.messages.values().next();
    if (!done) {
      this.message = value.message;
      this.onDismiss = value.onDismiss;
      this.messages.delete(value);
    }
  };

  @action
  dismiss = () => {
    this.message = undefined;
    this.onDismiss?.();
    this.onDismiss = undefined;
    setTimeout(this.dequeue, duration.animation);
  };

  interactiveMessages: InteractiveMessage[] = [];

  @observable
  interactiveMessage?: InteractiveMessage;

  shouldShowInteractiveMessageOnCurrentScreen = (screenName: string) =>
    !noInteractiveMessagesScreens.includes(screenName);

  @action
  enqueueInteractiveMessage = ({ severity = 'info', text, actions }: InteractiveMessage) => {
    this.interactiveMessages.push({ severity, text, actions });
    if (!this.interactiveMessage) this.dequeueInteractiveMessage();
  };

  @action
  dequeueInteractiveMessage = () => {
    this.interactiveMessage = this.interactiveMessages.shift();
  };

  @action
  dismissInteractiveMessage = () => {
    this.interactiveMessage = undefined;
    setTimeout(this.dequeueInteractiveMessage, duration.animation);
  };
}
