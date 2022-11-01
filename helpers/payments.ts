/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Moment } from 'moment-timezone';
import groupBy from 'lodash/groupBy';
import toPairs from 'lodash/toPairs';
import sumBy from 'lodash/sumBy';
import capitalize from 'lodash/capitalize';

import {
  Charge,
  PaymentInfo,
  Transactions,
  PaymentMethodChannel,
  PaymentMethod,
  ScheduledPayment,
} from '../mobx/stores/paymentTypes';
import { toMoment, today, parseAsInTimezone } from './moment-utils';
import { t } from '../i18n/trans';
import {
  GENERIC_EXPIRATION_MONTH,
  SHORT_DAY_OF_MONTH_FORMAT,
  SHORT_MONTH_DATE_YEAR_FORMAT,
  YEAR_MONTH,
  MONTH_DATE_FORMAT,
} from '../constants/date_formats';

export type DueDatesInfo = {
  dueDays: number;
  dueDate: string;
  absDueDays: number;
  isPastDue: boolean;
  chargeDate: Moment;
};

export const MAXIMUM_ALLOWED_PAYMENT = 10000;

export const getDueDates = (unitPayment: PaymentInfo): DueDatesInfo => {
  const chargeDate = toMoment((unitPayment.currentCharges || []).map((c: Charge) => c.dueDate).sort()[0]);

  const dueDays = chargeDate.diff(today(), 'days');
  const dueDate = chargeDate.format(SHORT_MONTH_DATE_YEAR_FORMAT);
  const isPastDue = chargeDate.isBefore(today(), 'day');
  return { dueDays, dueDate, absDueDays: Math.abs(dueDays), isPastDue, chargeDate };
};

export const getGroupCharges = (charges: Charge[]) => {
  const grouped = groupBy(charges, c => c.dueDate);

  return toPairs(grouped).map(([dueDate, groupCharges]) => ({
    dueDate,
    totalAmount: sumBy(groupCharges, c => c.balanceAmount),
    amountsByType: groupCharges.map(c => ({
      type: capitalize(c.description),
      amount: c.balanceAmount,
      clientGeneratedId: c.clientGeneratedId,
    })),
  }));
};

export const getDueText = (dueDays: number, isPastDue: boolean): string => {
  if (dueDays === -1) return t('OVERDUE_SINCE_YESTERDAY');
  if (dueDays === 0) return t('DUE_TODAY');
  if (dueDays === 1) return t('DUE_TOMORROW');

  const days = Math.abs(dueDays);
  return isPastDue ? t('OVERDUE_BY_DAYS', { days }) : t('DUE_IN_DAYS', { days: days || 0 });
};

export const formatAsCurrency = (value: number) =>
  Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export const getBalance = (unitPayment?: PaymentInfo) => {
  if (!unitPayment) return { balance: 0, formattedBalance: formatAsCurrency(0) };
  const balance = unitPayment.unitUserInfo?.balanceDueAmount || 0;

  return { balance, formattedBalance: formatAsCurrency(balance) };
};

export const getAllPastTransactions = (unitPayment?: PaymentInfo) => {
  const { transactions = {} as Transactions } = unitPayment || {};

  const result = Object.keys(transactions).reduce((acc: any[], transactionKey) => {
    const transactionValues = transactions[transactionKey as keyof Transactions];
    if (!transactionValues.length) return acc;

    const transactionsForEachType = (transactionValues as any[]).map((trans: any, idx: number) => {
      const date =
        trans.paymentDate ||
        trans.declineDate ||
        trans.voidDate ||
        trans.refundDate ||
        trans.reversalDate ||
        trans.date;

      return {
        ...trans,
        date,
        transactionType: transactionKey,
        key: transactionKey + idx.toString(),
      };
    });

    return [...acc, ...transactionsForEachType];
  }, []);

  return result.sort((a, b) => toMoment(b.date).diff(toMoment(a.date)));
};

export const getPaymentMethodText = (methodChannel?: string, isLower = false) => {
  switch (methodChannel) {
    case PaymentMethodChannel.CREDIT:
      return isLower ? t('CREDIT_CARD').toLocaleLowerCase() : t('CREDIT_CARD');
    case PaymentMethodChannel.DEBIT:
      return isLower ? t('DEBIT_CARD').toLocaleLowerCase() : t('DEBIT_CARD');
    case PaymentMethodChannel.ACH:
      return isLower ? t('ACH') : t('ACH_ACCOUNT');
    default:
      return '';
  }
};

export const getPaymentMethodIconName = (paymentMethod: PaymentMethod): string => {
  return paymentMethod.channelType === PaymentMethodChannel.ACH
    ? 'Bank'
    : `CreditCard${capitalize(paymentMethod.brand)}`;
};

export const getPaymentFeeText = (paymentMethod: PaymentMethod): string => {
  const { relativeServiceFeePrice = 0, absoluteServiceFeePrice = 0 } = paymentMethod || {};

  if (absoluteServiceFeePrice) return `${t('SERVICE_FEE')}: $${absoluteServiceFeePrice}`;

  if (relativeServiceFeePrice) return `${t('SERVICE_FEE')}: ${relativeServiceFeePrice}%`;

  return `${t('SERVICE_FEE')}: 0%`;
};

export const getPaymentFeeValue = (paymentMethod: PaymentMethod, value: number): number => {
  const { relativeServiceFeePrice = 0, absoluteServiceFeePrice = 0 } = paymentMethod || {};

  if (absoluteServiceFeePrice) return absoluteServiceFeePrice;

  if (relativeServiceFeePrice) return (relativeServiceFeePrice * value) / 100;

  return 0;
};

export const enhancePaymentsInfoWithAdditionalData = (paymentsInformation: PaymentInfo[]) =>
  paymentsInformation.map((paymentInfo: PaymentInfo) => {
    const { isPastDue } = getDueDates(paymentInfo);
    return {
      ...paymentInfo,
      hasOverduePayments: isPastDue,
      currentCharges: (paymentInfo.currentCharges || []).map((charge, index) => ({
        ...charge,
        clientGeneratedId: index, // we don't receive any id from Aptexx, but we need a unique value to avoid React error: 'Encountered two children with the same key'
      })),
      paymentMethods: (paymentInfo.paymentMethods || []).map(method => ({
        ...method,
        isGenericExpiration: method.isExpired && method.expirationDate === GENERIC_EXPIRATION_MONTH,
      })),
    };
  });

export const getUnitName = (unitPayment?: PaymentInfo) =>
  unitPayment ? `${unitPayment.unitUserInfo.buildingDisplayName}-${unitPayment.unitUserInfo.unitDisplayName}` : '';

const formattedDayOfMonth = (dayOfTheMonth: string) =>
  parseInt(dayOfTheMonth, 10) < 10 ? `0${dayOfTheMonth}` : dayOfTheMonth;

export const getNextScheduledPayment = (
  scheduledPaymentsByDayOfMonth: ScheduledPayment[],
  propertyTimezone: string,
) => {
  if (!scheduledPaymentsByDayOfMonth?.length) return null;

  const dateToMoment = (month: string, day: string) =>
    parseAsInTimezone(`${month}-${formattedDayOfMonth(day)}`, { timezone: propertyTimezone });

  const activeScheduledPayments = scheduledPaymentsByDayOfMonth.filter(sp => {
    if (sp.endMonth) {
      const startDate = dateToMoment(sp.startMonth, sp.dayOfMonth);
      const endDate = dateToMoment(sp.endMonth, sp.dayOfMonth);
      return (
        endDate.isAfter(today({ timezone: propertyTimezone }), 'month') ||
        (endDate.isSame(today({ timezone: propertyTimezone }), 'month') && startDate.isSameOrAfter(today(), 'day'))
      );
    }
    return true;
  });

  const nextSchedulePaymentDates = activeScheduledPayments.map(payment => {
    const thisMonth = today({ timezone: propertyTimezone }).format(YEAR_MONTH);
    const nextMonth = today({ timezone: propertyTimezone }).add(1, 'months').format(YEAR_MONTH);

    if (
      dateToMoment(payment.startMonth, payment.dayOfMonth).isSameOrAfter(today({ timezone: propertyTimezone }), 'day')
    ) {
      return dateToMoment(payment.startMonth, payment.dayOfMonth);
    }
    if (
      parseInt(payment.dayOfMonth, 10) >=
      parseInt(today({ timezone: propertyTimezone }).format(SHORT_DAY_OF_MONTH_FORMAT), 10)
    ) {
      return dateToMoment(thisMonth, payment.dayOfMonth);
    }
    return dateToMoment(nextMonth, payment.dayOfMonth);
  });

  if (nextSchedulePaymentDates.length) {
    const nextSchedulePayment = nextSchedulePaymentDates.sort((a, b) => a.diff(b))[0];
    if (nextSchedulePayment.isSame(today({ timezone: propertyTimezone }), 'day')) return t('DATE_TODAY');
    if (nextSchedulePayment.isSame(today({ timezone: propertyTimezone }).add(1, 'day'), 'day'))
      return t('DATE_TOMORROW');

    return nextSchedulePayment.format(MONTH_DATE_FORMAT);
  }

  return null;
};

export const getPaymentMethodByExternalId = (externalId: string, paymentMethods: PaymentMethod[]) =>
  externalId && paymentMethods.filter(pm => pm.externalId === externalId)[0];
