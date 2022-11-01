/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import orderBy from 'lodash/orderBy';
import uniq from 'lodash/uniq';
import { observable, action, runInAction, computed } from 'mobx';

import { UserSettings } from './userSettings';
import { Notification } from './notification';
import { UserIndicators } from './userIndicators';
import { makeRequest, RequestParams, mediator } from '../../network/helpers';
import { logger } from '../../helpers/logger';
import { t } from '../../i18n/trans';
import { isNull } from '../../helpers/nullish';
import { dismissNotifications } from '../../helpers/push-notifications';
import { EventTypes } from '../../constants/eventTypes';

export enum MessageDirection {
  In = 'in',
  Out = 'out',
}

export interface IMessage {
  id: string;
  author: string;
  message: string;
  direction: MessageDirection;
  threadId?: string;
  createdAt: Date;
  unread: boolean;
  propertyId: string;
}

export class Messages {
  userSettings: UserSettings;

  notification: Notification;

  userIndicators: UserIndicators;

  @computed
  get messages() {
    return orderBy(Array.from(this.messageMap.values()), 'createdAt', 'desc');
  }

  @observable
  messageMap: Map<string, IMessage> = new Map();

  @observable
  loadingMessagesInProgress = false;

  @observable
  threadId: string | undefined;

  @observable
  areMessagesLoaded = false;

  constructor(userSettings: UserSettings, notification: Notification, userIndicators: UserIndicators) {
    this.userSettings = userSettings;
    this.notification = notification;
    this.userIndicators = userIndicators;
    mediator().subscribe('messages:new', data => this.handleIncomingMessages(data.map((d: any) => d.message)));
    mediator().subscribe('socket:reconnect', () => this.getMessages());
  }

  @action
  resetStore = () => {
    this.clearMessages();
  };

  @action
  clearMessages = (): void => {
    this.messageMap.clear();
    this.areMessagesLoaded = false;
  };

  @action
  setMessages = (messages: IMessage[]): void => {
    this.messageMap.clear();
    messages.map(m => this.messageMap.set(m.id, m));
  };

  @action
  setIsLoadingMessages = ({ inProgress }: { inProgress: boolean }): void => {
    this.loadingMessagesInProgress = inProgress;
  };

  @action
  addNewMessages = (msgs: IMessage[]) => {
    if (!this.threadId && !this.messageMap.size) {
      this.setThreadId(msgs);
    }
    msgs.filter(msg => msg.threadId === this.threadId).map(m => this.messageMap.set(m.id, m));
  };

  @action
  handleIncomingMessages = (msgs: IMessage[]) => {
    const propertyIds = uniq(msgs.map(m => m.propertyId).filter(propertyId => !isNull(propertyId)));
    if (msgs.some(message => message.unread && message.direction === MessageDirection.Out)) {
      this.userIndicators.setIndicatorForProperties(propertyIds, 'hasUnreadMessages', true);
    }

    this.addNewMessages(msgs);
  };

  @action
  setThreadId = (msgs: IMessage[]) => {
    if (msgs.length) {
      this.threadId = msgs[0].threadId;
    } else {
      this.threadId = undefined;
    }
  };

  @computed
  get hasUnreadMessages() {
    const { selectedPropertyHasUnreadMessages } = this.userIndicators;

    return this.messages.length
      ? this.messages.some(message => message.unread && message.direction === MessageDirection.Out)
      : selectedPropertyHasUnreadMessages;
  }

  @computed
  get newestMessageId() {
    return this.messages.length && this.messages[0].id;
  }

  @action
  setMessagesLoaded = (status: boolean) => {
    this.areMessagesLoaded = status;
  };

  @action
  getMessages = async (): Promise<void> => {
    // TODO: Remove the repetitive code
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenanat server");
      return;
    }

    if (this.loadingMessagesInProgress) {
      logger.warn('network call is already in progress ');
      return;
    }

    const { propertyId } = this.userSettings.propertySelected || {};

    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/directMessages`,
      method: 'GET',
      onStatusChanged: this.setIsLoadingMessages,
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at getMessages' });
        logger.error('error at getting messages', error);
        return;
      }

      this.setMessages(data);
      this.setThreadId(data);
    });

    this.setMessagesLoaded(true);
  };

  @action
  sendMessage = async (msg: string): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenanat server");
      return;
    }

    const { propertyId } = this.userSettings.propertySelected || {};

    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/directMessages`,
      method: 'POST',
      body: { message: { text: msg, threadId: this.threadId } },
      onStatusChanged: this.setIsLoadingMessages,
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at sendMessage' });
        logger.error('error at sending message', error);
        return;
      }

      this.setThreadId(data);
      this.addNewMessages(data);
    });
  };

  @action
  markMessagesAsRead = async (ids: string[]): Promise<void> => {
    if (ids.length) {
      this.sendMarkMessagesAsReadRequest(ids);
      await dismissNotifications(EventTypes.DIRECT_MESSAGE_TO_RXP, ids);
    }
  };

  @action
  sendMarkMessagesAsReadRequest = async (ids: string[]): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenant server");
      return;
    }

    const { propertyId } = this.userSettings.propertySelected;
    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/directMessages/markAsRead`,
      method: 'POST',
      body: { messageIds: ids },
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.notification.enqueue({
          userMessage: t('SYSTEM_ERROR'),
          debugMessage: 'Error at sendMarkMessagesAsReadRequest',
        });
        logger.error('error at marking messages', error);
      }

      if (data?.length) {
        this.userIndicators.setIndicatorForProperties([propertyId], 'hasUnreadMessages', false);
        data.forEach((id: string) => {
          const message = this.messageMap.get(id);
          if (message) message.unread = false;
        });
      }
    });
  };
}
