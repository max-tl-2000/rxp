/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { IField, IFormModel, IFields, createModel } from 'mobx-form';
import { isValidPhoneNumber } from '../../helpers/validation/phone';
import { MaintenancePriority } from '../stores/maintenanceTypes';

export type ImageAttachment = {
  base64: string;
  uri: string;
  contentType?: string;
  timestamp?: number;
};

export interface IMaintenanceRequestFormData {
  inventoryId: string;
  location: string;
  priority: MaintenancePriority;
  type: string;
  phone: string;
  description: string;
  hasPermissionToEnter: boolean;
  hasPets: boolean;
  attachments: ImageAttachment[];
}

interface IMaintenanceRequestFormFields extends IFields {
  inventoryId: IField<string>;
  location: IField<string>;
  priority: IField<MaintenancePriority>;
  type: IField<string>;
  phone: IField<string>;
  description: IField<string>;
  hasPermissionToEnter: IField<boolean>;
  hasPets: IField<boolean>;
  attachments: IField<ImageAttachment[]>;
}

export interface IMaintenanceRequestForm extends IFormModel<IMaintenanceRequestFormData> {
  fields: IMaintenanceRequestFormFields;
}

const initialFormState: Partial<IMaintenanceRequestFormData> = {
  hasPermissionToEnter: true,
  hasPets: false,
  attachments: [],
};

export const createMaintenanceRequestForm = (
  initialState: IMaintenanceRequestFormData = initialFormState as IMaintenanceRequestFormData,
) => {
  const formModel: IMaintenanceRequestForm = createModel<IMaintenanceRequestFormData>({
    descriptors: {
      inventoryId: {
        required: 'PLEASE_SELECT_A_UNIT',
      },
      location: {
        required: 'PLEASE_SELECT_A_LOCATION',
      },
      type: {
        required: 'PLEASE_SELECT_A_MAINTENANCE_TYPE',
      },
      phone: {
        required: 'PLEASE_PROVIDE_PHONE_NUMBER',
        validator: async (field: IField<string>) => {
          if (!isValidPhoneNumber(field.value)) {
            throw new Error('PLEASE_PROVIDE_PHONE_NUMBER');
          }
        },
      },
      description: {
        required: 'PLEASE_PROVIDE_A_DESCRIPTION',
      },
      priority: {},
      hasPermissionToEnter: {},
      hasPets: {},
      attachments: {},
    },
    initialState,
  });

  return formModel;
};
