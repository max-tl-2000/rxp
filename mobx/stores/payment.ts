/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, computed, runInAction } from 'mobx';
import orderBy from 'lodash/orderBy';
import minBy from 'lodash/minBy';
import assign from 'lodash/assign';

import { addParamsToUrl } from '../../helpers/urlParams';
import { toMoment, today, isToday } from '../../helpers/moment-utils';
import { sortPaymentMethods } from '../../helpers/payment-sort';
import { t } from '../../i18n/trans';
import { aptexxConfig } from '../../config';
import { makeRequest, RequestParams, mediator } from '../../network/helpers';
import { UserSettings } from './userSettings';
import { Notification } from './notification';
import { Units } from './units';
import {
  PaymentInfo,
  AmountType,
  PaymentMethod,
  PaymentStatus,
  PaymentMethodChannel,
  PaymentProcessingStatus,
  Transaction,
  ScheduledTransactionMaps,
  ScheduledPayment,
} from './paymentTypes';
import { enhancePaymentsInfoWithAdditionalData, getBalance, getPaymentFeeValue } from '../../helpers/payments';
import { logger } from '../../helpers/logger';
import { SHORT_MONTH_DATE_YEAR_FORMAT, SHORT_DAY_OF_MONTH_FORMAT } from '../../constants/date_formats';
import { UserIndicators } from './userIndicators';

export class Payment {
  userSettings: UserSettings;

  notification: Notification;

  userIndicators: UserIndicators;

  units: Units;

  @observable
  errorToken?: string;

  @observable
  paymentsInfo: PaymentInfo[] = [];

  @observable
  isPaymentInfoLoading = false;

  @observable
  isPaymentInfoLoaded = false;

  @observable
  isRemovePaymentMethodLoading = false;

  @observable
  isRemovePaymentMethodError = false;

  @observable
  lastFourDigitsRemoved?: string;

  getPaymentInfoAbortController?: AbortController;

  afterAbortAction?: () => void;

  @computed
  get paymentInfoItems() {
    return orderBy(this.paymentsInfo, 'unitUserInfo.balanceDueDate', 'asc');
  }

  @computed
  get paymentMethods() {
    return this.selectedUnitPayment?.paymentMethods;
  }

  @computed
  get sortedPayments() {
    return sortPaymentMethods(this.paymentMethods || []);
  }

  constructor(userSettings: UserSettings, notification: Notification, units: Units, userIndicators: UserIndicators) {
    this.notification = notification;
    this.userSettings = userSettings;
    this.units = units;
    this.userIndicators = userIndicators;
    this.errorToken = undefined;

    mediator().subscribe('paymentMethod:new', data =>
      this.addPaymentMethod(data.map((d: any) => d.payload).find((pm: any) => pm)),
    );

    mediator().subscribe('scheduledPayment:new', () => {
      this.setNewPaymentWasScheduled(true);
      this.getPaymentInfo();
    });

    mediator().subscribe('scheduledTransactions:poll', this.getScheduledTransactions);
  }

  @computed
  get hasOverduePayments() {
    return this.paymentsInfo.length && !this.isPaymentInfoLoading
      ? this.paymentsInfo.some(paymentInfo => paymentInfo.hasOverduePayments)
      : this.userIndicators.selectedPropertyHasOverduePayments;
  }

  @computed
  get firstValidNonDefaultPaymentMethod() {
    return this.sortedPayments.find(paymentMethod => !paymentMethod.isExpired && !paymentMethod.isDefault);
  }

  @computed
  get paymentStatus() {
    if (!this.paymentsInfo.length) return undefined; // to avoid index out of bounds warning
    return this.paymentsInfo[0].unitUserInfo?.paymentStatus;
  }

  @computed
  get paymentNotPermitted() {
    return this.paymentStatus === PaymentStatus.PAYMENT_NOT_PERMITTED;
  }

  @computed
  get onlyCardPaymentsAllowed() {
    return this.paymentStatus === PaymentStatus.CERTIFIED_PAYMENT_PERMITTED;
  }

  @computed
  get noValidPaymentMethod() {
    const { sortedPayments, onlyCardPaymentsAllowed } = this;

    return !sortedPayments.find(pm => {
      if (onlyCardPaymentsAllowed && pm.channelType === PaymentMethodChannel.ACH) return false;

      return !pm.isExpired;
    });
  }

  scheduledTransactions: ScheduledTransactionMaps = {
    payments: new Map<string, Transaction>(),
    declines: new Map<string, Transaction>(),
  };

  @action
  setErrorToken = (token?: string) => {
    this.errorToken = token;
  };

  @action
  setPaymentsInfo = (paymentsInfo: PaymentInfo[]): void => {
    this.paymentsInfo = paymentsInfo;

    const hasOverduePayments = paymentsInfo.some(paymentInfo => paymentInfo.hasOverduePayments);
    this.userSettings.selectedPropertyId &&
      this.userIndicators.setIndicatorForProperties(
        [this.userSettings.selectedPropertyId],
        'hasOverduePayments',
        hasOverduePayments,
      );
  };

  @action
  resetPaymentsInfo = () => this.setPaymentsInfo([]);

  @action
  resetStore = () => {
    this.resetPaymentsInfo();
    this.setIsPaymentInfoLoaded(false);
  };

  @observable
  selectedInventoryId?: string;

  @computed
  get selectedUnitPayment() {
    return this.paymentsInfo.find(pi => pi.unitUserInfo.inventoryId === this.selectedInventoryId);
  }

  @action
  setSelectedUnitPayment = (paymentInfo?: PaymentInfo) => {
    this.selectedInventoryId = paymentInfo?.unitUserInfo.inventoryId;
    this.setSelectedPaymentMethod(this.defaultPaymentMethod);
  };

  @action
  setRemovePaymentMethodLoading = (status: boolean) => {
    this.isRemovePaymentMethodLoading = status;
  };

  @action
  setRemovePaymentMethodError = (error: boolean) => {
    this.isRemovePaymentMethodError = error;
  };

  @action
  setLastRemovedPaymentMethodDigits = (paymentMethodLastDigits?: string) => {
    this.lastFourDigitsRemoved = paymentMethodLastDigits;
  };

  @action
  updateSelectedPaymentInfo = (delta: Partial<PaymentInfo>) => {
    const { selectedUnitPayment } = this;

    if (!selectedUnitPayment?.unitUserInfo?.inventoryId) return;

    this.updatePaymentInfo(delta, selectedUnitPayment.unitUserInfo.inventoryId);
  };

  @action
  updatePaymentInfo = (delta: Partial<PaymentInfo>, inventoryId: string) => {
    const unitPayment = this.paymentsInfo.find(pi => pi.unitUserInfo.inventoryId === inventoryId);

    if (!unitPayment) return;

    const updatedUnitPayment = assign(unitPayment, delta);

    const updatedPaymentsInfo = this.paymentsInfo.map(pi =>
      pi.unitUserInfo.inventoryId === inventoryId ? updatedUnitPayment : pi,
    );

    this.setPaymentsInfo(updatedPaymentsInfo);
  };

  @action
  setIsPaymentInfoLoading = ({ inProgress }: { inProgress: boolean }): void => {
    this.isPaymentInfoLoading = inProgress;
  };

  @action
  setIsPaymentInfoLoaded = (loaded: boolean): void => {
    this.isPaymentInfoLoaded = loaded;
  };

  @action
  setAbortGetPaymentInfoController = (abortController: AbortController) => {
    this.getPaymentInfoAbortController = abortController;
  };

  performAfterAbortAction = () => {
    const act = this.afterAbortAction;
    this.afterAbortAction = undefined;
    act && act();
  };

  @action
  getPaymentInfo = async (): Promise<void> => {
    if (this.isPaymentInfoLoading && this.getPaymentInfoAbortController) {
      logger.info('a previous GET /paymentInfo request is in progress, aborting for a new one');

      this.afterAbortAction = () => this.getPaymentInfo();
      this.getPaymentInfoAbortController?.abort();
      return;
    }

    this.setErrorToken(undefined);

    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};
    const { paymentModule } = this.userSettings.propertySelected.features || {};

    if (!paymentModule) return;

    logger.info('loading payment info for property', { propertyId });

    if (!serverUrl || !propertyId) {
      logger.error('cannot determine tenant server or propertyId');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at getPaymentInfo - no serverUrl or propertyId',
      });
      return;
    }

    const { data, error, aborted } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/paymentInfo`,
      method: 'GET',
      onStatusChanged: this.setIsPaymentInfoLoading,
      onAbortControllerReady: this.setAbortGetPaymentInfoController,
    });

    if (aborted) {
      logger.info('GET /paymentInfo request aborted');
      this.performAfterAbortAction();
      return;
    }

    if (error) {
      this.setErrorToken(error.token);
      this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at getPaymentInfo' });
      logger.error('error at getting payment info', error);
      this.setIsPaymentInfoLoaded(true);
      return;
    }

    const enhancedPaymentsInfo = enhancePaymentsInfoWithAdditionalData(data);

    runInAction(() => {
      this.setIsPaymentInfoLoaded(true);
      this.setPaymentsInfo(enhancedPaymentsInfo);
      if (this.paymentsInfo.length === 1) this.setSelectedUnitPayment(this.paymentsInfo[0]);
    });
  };

  notifyAboutScheduledTransactions = () => {
    Array.from(this.scheduledTransactions.payments.values()).forEach(p => {
      if (p.wasShown || !isToday(p.date)) return;

      this.notification.enqueue({ userMessage: t('SCHEDULED_PAYMENT_PROCESSED_SUCCESSFULLY') });
      this.scheduledTransactions.payments.set(p.providerTransactionId, { ...p, wasShown: true });
      this.markScheduledTransactionAsSeen(p.providerTransactionId);
    });

    orderBy(Array.from(this.scheduledTransactions.declines.values()), p => p.date, 'desc').forEach(p => {
      if (p.wasShown) return;

      // reason has form: "17:Amount greater than limit", we need only "Amount greater than limit"
      const formatReason = (reason: string) => reason.split(':').slice(-1)[0];

      this.notification.enqueueInteractiveMessage({
        severity: 'error',
        text: t('SCHEDULED_PAYMENT_DECLINE_MESSAGE', {
          date: toMoment(p.date).format(SHORT_MONTH_DATE_YEAR_FORMAT),
          unitName: this.units.unitsInfo.find(u => u.id === p.inventoryId)?.unitDisplayName,
          reason: p.reason ? t('REASON', { reason: formatReason(p.reason) }) : '',
        }),
        actions: [
          {
            label: t('LEARN_MORE'),
            action: () => {
              const paymentInfoToSelect = this.paymentsInfo.find(
                pi => pi.unitUserInfo.inventoryId === p.providerTransactionId,
              );
              if (paymentInfoToSelect) this.setSelectedUnitPayment(paymentInfoToSelect);
              this.markScheduledTransactionAsSeen(p.providerTransactionId);

              return {
                navigationRoute: 'DeclinedTransactionInfo',
              };
            },
          },
          {
            label: t('DISMISS'),
            action: () => {
              this.markScheduledTransactionAsSeen(p.providerTransactionId);
              return { shouldDismiss: true };
            },
          },
        ],
      });

      this.scheduledTransactions.declines.set(p.providerTransactionId, { ...p, wasShown: true });
    });
  };

  @action
  getScheduledTransactions = async (): Promise<void> => {
    this.setErrorToken(undefined);
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};
    const { paymentModule } = this.userSettings.propertySelected.features || {};

    if (!paymentModule) return;

    logger.info('getting scheduled transactions for property', { propertyId });

    if (!serverUrl || !propertyId) {
      logger.error('cannot determine tenant server or propertyId');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at getScheduledTransactions - no serverUrl or propertyId',
      });
      return;
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/scheduledTransactions`,
      method: 'GET',
    } as RequestParams);

    if (error) {
      this.setErrorToken(error.token);
      this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at getScheduledTransactions' });
      logger.error('error at getting scheduled transactions', error);
      return;
    }

    data.payments?.forEach((p: Transaction) => {
      if (!this.scheduledTransactions.payments.has(p.providerTransactionId)) {
        this.scheduledTransactions.payments.set(p.providerTransactionId, p);
      }
    });

    data.declines?.forEach((p: Transaction) => {
      if (!this.scheduledTransactions.declines.has(p.providerTransactionId)) {
        this.scheduledTransactions.declines.set(p.providerTransactionId, p);
      }
    });

    this.notifyAboutScheduledTransactions();
  };

  markScheduledTransactionAsSeen = async (providerTransactionId: string) => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};

    if (!serverUrl || !propertyId) {
      logger.error('cannot determine tenant server or propertyId');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at markScheduledTransactionAsSeen - no serverUrl or propertyId',
      });
      return;
    }

    const { error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/scheduledTransactions/${providerTransactionId}/seen`,
      method: 'post',
    } as RequestParams);

    if (error) {
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at markScheduledTransactionAsSeen',
      });
      logger.error('error while marking scheduled transaction as seen', { error, providerTransactionId });
    }
  };

  @action
  deletePaymentMethod = async (
    paymentMethodId: string | undefined,
    externalPaymentMethodId: string | undefined,
    removedLastFourDigits: string | undefined,
  ): Promise<void> => {
    this.setRemovePaymentMethodLoading(true);
    this.setLastRemovedPaymentMethodDigits(removedLastFourDigits);
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};

    if (!serverUrl || !propertyId) {
      logger.error('cannot determine tenant server or propertyId');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at deletePaymentMethod - no serverUrl or propertyId',
      });
      return;
    }

    const { error } = await makeRequest({
      serverUrl,
      path: `/resident/api/paymentMethods/${paymentMethodId}`,
      method: 'DELETE',
      body: { externalPaymentMethodId, propertyId },
      onStatusChanged: this.setIsPaymentInfoLoading,
    } as RequestParams);

    if (error) {
      this.setRemovePaymentMethodError(true);
      this.setRemovePaymentMethodLoading(false);
      this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at deletePaymentMethod' });
      logger.error('error at deleting payment method', error);
      return;
    }

    runInAction(() => {
      const newPaymentMethods = this.paymentMethods?.filter(paymentMethod => paymentMethod.id !== paymentMethodId);

      this.updateSelectedPaymentInfo({ paymentMethods: newPaymentMethods });
      this.setRemovePaymentMethodLoading(false);
    });
  };

  @action
  makeDefaultPaymentMethod = async (paymentMethodId: string): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};

    if (!serverUrl || !propertyId) {
      logger.error('cannot determine tenant server or propertyId');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at makeDefaultPaymentMethod - no serverUrl or propertyId',
      });
    }

    const { error } = await makeRequest({
      serverUrl,
      path: `/resident/api/paymentMethods/changeDefault/${paymentMethodId}`,
      method: 'PATCH',
      onStatusChanged: this.setIsPaymentInfoLoading,
    } as RequestParams);

    if (error) {
      this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at makeDefaultPaymentMethod' });
      logger.error('error at changing default payment method', error);
      return;
    }

    runInAction(() => {
      const paymentMethod = this.sortedPayments.find(method => method.id === paymentMethodId);
      const newPaymentMethods = this.paymentMethods?.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      }));
      this.updateSelectedPaymentInfo({ paymentMethods: newPaymentMethods });
      this.setSelectedPaymentMethod(paymentMethod);
    });
  };

  @observable
  fixedAmount = 0;

  @action
  setFixedAmount = (amount: number) => {
    this.fixedAmount = amount;
  };

  @observable
  amountType = AmountType.Balance;

  @action
  setAmountType = (type: AmountType) => {
    this.amountType = type;
  };

  @action
  resetAmountAndType = () => {
    this.setFixedAmount(0);
    this.setAmountType(AmountType.Balance);
  };

  @observable
  shouldResetAmount = true;

  @action
  setShouldResetAmountFlag = (shouldReset: boolean) => {
    this.shouldResetAmount = shouldReset;
  };

  @observable
  paymentProcessingStatus = PaymentProcessingStatus.None;

  @computed
  get isPaymentInProgress() {
    return this.paymentProcessingStatus === PaymentProcessingStatus.InProgress;
  }

  @computed
  get isPaymentSuccessful() {
    return this.paymentProcessingStatus === PaymentProcessingStatus.Success;
  }

  @computed
  get hasPaymentFailed() {
    return (
      this.paymentProcessingStatus === PaymentProcessingStatus.Failed ||
      this.paymentProcessingStatus === PaymentProcessingStatus.Expired
    );
  }

  @action
  dismissPaymentStatus = () => {
    this.paymentProcessingStatus = PaymentProcessingStatus.None;
  };

  @action
  setIsPaymentInProgress = ({ inProgress }: { inProgress: boolean }): void => {
    if (inProgress) this.paymentProcessingStatus = PaymentProcessingStatus.InProgress;
  };

  @action
  setIsPaymentSuccessful = () => {
    this.paymentProcessingStatus = PaymentProcessingStatus.Success;
  };

  @action
  setHasPaymentFailed = (status: PaymentProcessingStatus) => {
    this.paymentProcessingStatus = status;
  };

  @action
  createPayment = async (paymentAmount: number): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenant server");
      return;
    }

    const { propertyId } = this.userSettings.propertySelected;

    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { inventoryId } = this.selectedUnitPayment?.unitUserInfo || {};

    if (!inventoryId) {
      throw new Error('No selected inventoryId!');
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/payment`,
      method: 'POST',
      body: { inventoryId, paymentAmount, paymentMethodId: this.selectedPaymentMethod?.id },
      onStatusChanged: this.setIsPaymentInProgress,
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.setHasPaymentFailed(PaymentProcessingStatus.Failed);
        return;
      }
      if (data.error) {
        this.setHasPaymentFailed(
          data.error === 'PAYMENT_EXPIRED' ? PaymentProcessingStatus.Expired : PaymentProcessingStatus.Failed,
        );
        return;
      }

      this.setIsPaymentSuccessful();
      this.getPaymentInfo();
    });
  };

  @observable
  selectedPaymentMethod?: PaymentMethod;

  @computed
  get activePaymentMethods() {
    return this.selectedUnitPayment?.paymentMethods.filter(pm => {
      if (this.onlyCardPaymentsAllowed && pm.channelType === PaymentMethodChannel.ACH) return false;

      return !pm.isExpired;
    });
  }

  @computed
  get defaultPaymentMethod() {
    /*
      If paymentStatus is CERTIFIED_PAYMENT_PERMITTED, the default payment method can only
      be active and of type credit/debit.

      If paymentStatus is of other types the default payment can be of any type and it will be
      the one marked as default in the db, regardless if it's active or not, because we need to
      notify the user of it's expired state
    */

    if (this.onlyCardPaymentsAllowed) {
      const defaultMethodCertifiedMethod = this.activePaymentMethods?.find(pm => pm.isDefault);
      const firstActivePaymentMethod = this.activePaymentMethods?.[0];

      return defaultMethodCertifiedMethod || firstActivePaymentMethod;
    }

    return this.selectedUnitPayment?.paymentMethods?.find(pm => pm.isDefault);
  }

  @computed
  get isLowerFeeAvailable() {
    const { selectedUnitPayment } = this;
    const { balance } = getBalance(selectedUnitPayment);

    const paymentMethodWithLowestFee = minBy(selectedUnitPayment?.paymentMethods, pm => {
      return getPaymentFeeValue(pm, balance);
    });

    return (
      this.defaultPaymentMethod &&
      paymentMethodWithLowestFee &&
      getPaymentFeeValue(paymentMethodWithLowestFee, balance) < getPaymentFeeValue(this.defaultPaymentMethod, balance)
    );
  }

  @action
  setSelectedPaymentMethod = (selectedPaymentMethod?: PaymentMethod) => {
    this.selectedPaymentMethod = selectedPaymentMethod;
  };

  @observable
  paymentMethodLink = '';

  @observable
  schedulePaymentLink = '';

  @observable
  isNewPaymentMethodReceived = false;

  @observable
  addPaymentMethodError = false;

  @observable
  schedulePaymentFailed = false;

  @observable
  newReceivedPaymentMethod?: PaymentMethod;

  @observable
  newPaymentWasScheduled = false;

  @action
  setNewPaymentMethodReceived = (status: boolean, paymentMethod?: PaymentMethod) => {
    this.isNewPaymentMethodReceived = status;
    if (paymentMethod) this.newReceivedPaymentMethod = paymentMethod;
  };

  @action
  resetNewPaymentMethodReceived = () => {
    this.isNewPaymentMethodReceived = false;
    this.newReceivedPaymentMethod = undefined;
  };

  @action
  setAddPaymentMethodError = (error: boolean) => {
    this.addPaymentMethodError = error;
  };

  @action
  setSchedulePaymentFailed = (failed: boolean) => {
    this.schedulePaymentFailed = failed;
  };

  @action
  initiatePaymentMethod = async (): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId, tenantName } = this.userSettings.propertySelected || {};
    const { inventoryId } = this.selectedUnitPayment?.unitUserInfo || {};
    const { paymentMethodSuccessUrl, paymentMethodCancelUrl } = aptexxConfig;

    if (!serverUrl || !propertyId || !inventoryId) {
      logger.error('cannot determine tenant server, propertyId or inventoryId');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at initiatePaymentMethod - no serverUrl or propertyId',
      });
      return;
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/paymentMethods/initiate`,
      method: 'POST',
      body: {
        inventoryId,
        propertyId,
        successUrl: `${serverUrl}${paymentMethodSuccessUrl}`,
        cancelUrl: `${serverUrl}${paymentMethodCancelUrl}`,
        tenantName,
      },
    } as RequestParams);

    if (error) {
      this.setAddPaymentMethodError(true);
      logger.error('error initiating new payment method', error);
      return;
    }

    runInAction(() => {
      if (data.length) {
        this.paymentMethodLink = data;
      }
    });
  };

  @action
  addPaymentMethod = (paymentMethod: PaymentMethod) => {
    runInAction(() => {
      const { inventoryId } = paymentMethod;

      if (!inventoryId) return;

      const unitPayment = this.paymentsInfo.find(pi => pi.unitUserInfo.inventoryId === inventoryId);
      const newPaymentMethods = unitPayment?.paymentMethods.concat(paymentMethod);
      this.updatePaymentInfo({ paymentMethods: newPaymentMethods }, inventoryId);

      if (inventoryId === this.selectedUnitPayment?.unitUserInfo?.inventoryId) {
        this.setNewPaymentMethodReceived(true, paymentMethod);
      }
    });
  };

  @action
  setNewPaymentWasScheduled = (newPaymentWasScheduled: boolean) => {
    this.newPaymentWasScheduled = newPaymentWasScheduled;
  };

  @action
  initiateScheduledPayment = async (): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};
    const { inventoryId } = this.selectedUnitPayment?.unitUserInfo || {};

    const { schedulePaymentSuccessUrl, schedulePaymentCancelUrl } = aptexxConfig;

    if (!serverUrl || !propertyId || !inventoryId) {
      logger.error('cannot determine tenant server, propertyId or inventoryId');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at initiateScheduledPayment - no serverUrl, propertyId or inventoryId',
      });
      return;
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/initiateScheduledPayment`,
      method: 'POST',
      body: {
        inventoryId,
        successUrl: `${serverUrl}${schedulePaymentSuccessUrl}`,
        cancelUrl: `${serverUrl}${schedulePaymentCancelUrl}`,
      },
    } as RequestParams);

    if (error) {
      this.setSchedulePaymentFailed(true);
      logger.error('error scheduling new payment', error);
      return;
    }

    runInAction(() => {
      logger.info('initiate schedule payment result', data);
      this.schedulePaymentLink = data;
    });
  };

  @computed
  get scheduledPayments() {
    return this.selectedUnitPayment?.scheduledPayments
      ?.slice()
      ?.sort((a, b) => toMoment(b.startMonth).diff(toMoment(a.startMonth)));
  }

  @computed
  get scheduledPaymentsByDayOfMonth() {
    const startOfMonth = today().startOf('month').format(SHORT_DAY_OF_MONTH_FORMAT);
    const endOfMonth = today().endOf('month').format(SHORT_DAY_OF_MONTH_FORMAT);

    const getDayOfMonth = (scheduledPayment: ScheduledPayment) => {
      if (scheduledPayment.dayOfMonth === 'FIRST_DAY') return startOfMonth;
      if (scheduledPayment.dayOfMonth === 'LAST_DAY') return endOfMonth;
      return scheduledPayment.dayOfMonth;
    };

    const normalizedScheduledPayments = this.selectedUnitPayment?.scheduledPayments?.map(s => ({
      ...s,
      dayOfMonth: getDayOfMonth(s),
    }));

    return normalizedScheduledPayments?.sort((a, b) => parseInt(a.dayOfMonth, 10) - parseInt(b.dayOfMonth, 10));
  }

  @action
  removeScheduledPayment = async (externalId?: number) => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};

    if (!serverUrl || !propertyId || !externalId) {
      logger.error('cannot determine tenant server, propertyId or externalid');
      this.notification.enqueue({
        userMessage: t('SYSTEM_ERROR'),
        debugMessage: 'Error at removeScheduledPayment - no serverUrl or propertyId',
      });
      return;
    }

    const queryParams = {
      externalId,
    };

    const { error } = await makeRequest({
      serverUrl,
      path: addParamsToUrl(`/resident/api/properties/${propertyId}/scheduledPayments`, queryParams),
      method: 'DELETE',
    } as RequestParams);

    if (error) {
      this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at removeScheduledPayment' });
      logger.error('error removing scheduled payment', error);
      return;
    }

    runInAction(() => {
      const newScheduledPayments = this.selectedUnitPayment?.scheduledPayments.filter(
        sp => sp.providerId !== externalId,
      );
      this.updateSelectedPaymentInfo({ scheduledPayments: newScheduledPayments });
    });
  };
}
