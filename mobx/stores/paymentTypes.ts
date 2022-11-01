/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* SAMPLE PAYMENT INFO
Array [
  Object {
    "currentCharges": Array [
      Object {
        "balanceAmount": 800,
        "description": "May rent",
        "dueDate": "2020-05-05T00:00:00-05:00",
        "clientGeneratedId": 0,
        "totalChargeAmount": 1000,
        "type": "rent",
      },
      Object {
        "balanceAmount": 20,
        "description": "May pet rent",
        "dueDate": "2020-05-05T00:00:00-05:00",
        "clientGeneratedId": 1,
        "totalChargeAmount": 30,
        "type": "pet",
      },
    ],
    "paymentMethods": Array [
      Object {
        "brand": "VISA",
        "channel": "DEBIT",
        "expirationMonth": "01/21",
        "relativeServiceFeePrice": 2.5,
        "id": "fe1d9ce7-be71-47f6-90b7-4bda012121ff",
        "isExpired": false,
        "lastFour": "4747",
      },
      Object {
        "brand": "VISA",
        "channel": "CREDIT",
        "expirationMonth": "02/22",
        "relativeServiceFeePrice": 2.5,
        "id": "d61a6471-2b48-4c9d-80be-831dd7194886",
        "lastFour": "1234",
      },
    ],
    "transactions": Object {
      "declines": Array [],
      "payments": Array [
        Object {
          "amount": 500,
          "checkMemo": "May rent",
          "checkNumber": 123,
          "date": "2020-05-05T12:34:00-05:00",
          "fee": 4.95,
          "method": Object {
            "brand": "VISA",
            "channel": "DEBIT",
            "lastFour": "5555",
          },
          "providerTransactionId": "20589129",
          "totalAmount": 504.95,
        },
        Object {
          "amount": 500,
          "checkNumber": 123,
          "date": "2020-06-05T12:34:00-05:00",
          "fee": 0,
          "memo": "June Rent",
          "method": Object {
            "brand": "VISA",
            "channel": "ACH",
            "lastFour": "1234",
          },
        },
      ],
      "refunds": Array [],
      "reversals": Array [],
      "voids": Array [],
    },
    "unitUserInfo": Object {
      "balanceDueAmount": 180,
      "balanceDueDate": "2020-08-20T00:00:00-05:00",
      "buildingDisplayName": "300",
      "fullyQualifiedName": "lark-300-121",
      "paymentStatus": "ACCEPT",
      "totalChargeAmount": 103,
      "unitDisplayName": "121",
    },
  },
]
*/

export interface Charge {
  balanceAmount: number;
  description: string;
  dueDate: string;
  clientGeneratedId: number;
  totalChargeAmount: number;
  type: string;
}

export enum PaymentMethodChannel {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  ACH = 'ACH',
}

export enum PaymentTypes {
  DECLINES = 'declines',
  PAYMENTS = 'payments',
  REFUNDS = 'refunds',
  REVERSALS = 'reversals',
  VOIDS = 'voids',
}

export enum PaymentProcessingStatus {
  None,
  InProgress,
  Success,
  Failed,
  Expired,
}
export interface PaymentMethod {
  brand: string;
  channelType: PaymentMethodChannel;
  expirationDate: string;
  relativeServiceFeePrice?: number;
  absoluteServiceFeePrice?: number;
  id: string;
  isExpired: boolean;
  lastFour: string;
  isDefault: boolean;
  externalId: string;
  isGenericExpiration: boolean;
  inventoryId?: string;
}

export enum PaymentStatus {
  PAYMENT_PERMITTED = 'PAYMENT_PERMITTED',
  PAYMENT_NOT_PERMITTED = 'PAYMENT_NOT_PERMITTED',
  CERTIFIED_PAYMENT_PERMITTED = 'CERTIFIED_PAYMENT_PERMITTED',
}

export interface UnitUserInfo {
  inventoryId: string;
  buildingDisplayName: string;
  fullyQualifiedName: string;
  totalChargeAmount: number;
  unitDisplayName: string;
  balanceDueAmount?: number;
  balanceDueDate?: string;
  paymentStatus?: PaymentStatus;
  isPastResident?: boolean;
  integrationIdIsMissing?: boolean;
}

export interface Transaction {
  amount: number;
  checkMemo: string;
  checkNumber: number;
  date: string;
  fee: number;
  method: PaymentMethod;
  providerTransactionId: string;
  totalAmount: number;
  inventoryId: string;
  reason?: string;
}

export type ScheduledTransactionMaps = {
  payments: Map<string, Transaction & { wasShown?: boolean }>;
  declines: Map<string, Transaction & { wasShown?: boolean }>;
};

export interface Transactions {
  payments: Transaction[];
  declines: Transaction[]; // type TBD
  refunds: any[]; // type TBD
  reversals: any[]; // type TBD
  voids: any[]; // type TBD
}

export enum ScheduledPaymentFrequency {
  MONTHLY = 'MONTHLY',
}

export interface ScheduledPayment {
  providerId: number;
  frequency: ScheduledPaymentFrequency;
  startMonth: string;
  endMonth: string;
  dayOfMonth: string;
  paymentMethodProviderId: number;
  paymentAmount: number;
  paymentAccountName: string;
}

export interface PaymentInfo {
  currentCharges: Charge[];
  paymentMethods: PaymentMethod[];
  transactions: Transactions;
  unitUserInfo: UnitUserInfo;
  hasOverduePayments: boolean;
  scheduledPayments: ScheduledPayment[];
  integrationIdIsMissing?: boolean;
}

export interface PaymentTransactionsHistory {
  amount: number;
  checkNumber: number;
  paymentDate: string;
  declineDate: string;
  voidDate: string;
  refundDate: string;
  reversalDate: string;
  date: string;
  fee: number;
  reversalFee: number;
  memo: string;
  method: {
    brand: string;
    channelType: string;
    lastFour: string;
  };
  providerTransactionId: string;
  providerRefundedTransactionId: string;
  reversalTransactionId: string;
  voidAmount: number;
  refundAmount: number;
  reversalAmount: number;
  transactionType: string;
  key: string;
  totalAmount: number;
  reason?: string;
}

export enum AmountType {
  Balance,
  Fixed,
}
