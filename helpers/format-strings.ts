/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
export const applyTitleCaseWithoutUnderscores = (string: string) =>
  string
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLocaleLowerCase())
    .join(' ');
