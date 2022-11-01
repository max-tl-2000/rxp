/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { IField, IFormModel, IFields, createModel } from 'mobx-form';
import { action } from 'mobx';
import { isPasswordValid } from '../../helpers/validation/password';

export interface ISignUpFormData {
  _name_: string;
  email: string;
  password: string;
}

interface ISignUpFormFields extends IFields {
  email: IField<string>;
  password: IField<string>;
}

export interface ISignUpForm extends IFormModel<ISignUpFormData> {
  fields: ISignUpFormFields;
  clearPassword(): void;
}

export const createSignUpForm = (initialState: ISignUpFormData = {} as ISignUpFormData) => {
  const formModel: ISignUpForm = createModel<ISignUpFormData>({
    descriptors: {
      _name_: {},
      email: {
        required: 'THE_EMAIL_IS_REQUIRED',
      },
      password: {
        validator: async (field: IField<string>) => {
          if (!field.value) {
            throw new Error('THE_PASSWORD_IS_REQUIRED');
          }
          if (!isPasswordValid(field.value)) {
            throw new Error('PASSWORD_MIN_CHARACTERS');
          }
        },
      },
    },
    initialState,
  });

  formModel.clearPassword = action(() => {
    formModel.updateFrom({ password: '' } as ISignUpFormData);
  });

  return formModel;
};
