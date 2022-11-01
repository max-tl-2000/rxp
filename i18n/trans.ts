/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import * as Localization from 'expo-localization';
import i18n, { TranslateOptions, Scope } from 'i18n-js';

import { translations as en } from './langs/en-tokens';
import { translations as es } from './langs/es-tokens';

i18n.translations = {
  en,
  es,
};

i18n.locale = Localization.locale;

i18n.fallbacks = true;

export const t = (scope: Scope, options?: TranslateOptions) => {
  return i18n.t(scope, options);
};
