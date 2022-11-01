/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
const ignorePrefixesAndSuffixes = [
  'Jr',
  'Sr',
  'Jnr',
  'Snr',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'Esq',
  'PhD',
  'MD',
  'Mr',
  'Ms',
  'Mrs',
  'Mme',
].map(entry => new RegExp(`^${entry}\\.$|^${entry}$`, 'i'));

export const getAvatarInitials = (displayedName = '', includeNumbersOnInitials = false): string => {
  let parts = displayedName.trim().split(/\s+/);

  if (parts.length > 1) {
    // might be controversial but someone can actually be named Mrs or might be as well have a surname like Esq
    // so to try to avoid all those cases we only attempt to remove prefixes/suffixes if more than 1 parts are found
    parts = parts.filter((part, i) => {
      if (i === 0 || i === parts.length - 1) {
        const isMatch = ignorePrefixesAndSuffixes.some(regex => part.match(regex));
        return !isMatch;
      }
      return true;
    });
  }

  parts = parts.map(line => line[0]);

  const initialsArr = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0] || ''];
  const initialRegex = includeNumbersOnInitials ? /[a-zA-Z0-9\u00C0-\u024F]/ : /[a-zA-Z\u00C0-\u024F]/;
  return !initialsArr.every(letter => letter.match(initialRegex)) ? '?' : initialsArr.join('').toUpperCase();
};
