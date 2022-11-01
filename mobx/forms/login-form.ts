/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { IField, IFormModel, IFields, createModel } from 'mobx-form';
import { action } from 'mobx';

import { isEmailValid } from '../../helpers/validation/email';

export interface ISignInFormData {
  _name_: string;
  email: string;
  password: string;
}

interface ISignInFormFields extends IFields {
  email: IField<string>;
  password: IField<string>;
}

export interface ISignInForm extends IFormModel<ISignInFormData> {
  fields: ISignInFormFields;
  clearPassword(): void;
  clearEmail(): void;
}

export const createSignInForm = (initialState: ISignInFormData = {} as ISignInFormData) => {
  const formModel: ISignInForm = createModel<ISignInFormData>({
    descriptors: {
      email: {
        required: 'THE_EMAIL_IS_REQUIRED',
        validator: async (field: IField<string>) => {
          const val = (field.value || '').trim();
          if (!isEmailValid(val)) {
            throw new Error('ENTER_A_VALID_EMAIL');
          }
        },
      },
      password: {
        validator: async (field: IField<string>) => {
          if (!field.value) {
            throw new Error('THE_PASSWORD_IS_REQUIRED');
          }
        },
      },
      _name_: {},
    },
    initialState,
  });

  formModel.clearPassword = action(() => {
    formModel.updateFrom({ password: '' } as ISignInFormData);
  });

  formModel.clearEmail = action(() => {
    formModel.updateFrom({ email: '' } as ISignInFormData);
  });

  return formModel;
};
