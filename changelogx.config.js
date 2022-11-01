/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-param-reassign */
const usersHash = {
  'Roy Riojas': 'royriojas',
  'Lehel Vass': 'vasslehel',
  Lehel: 'vasslehel',
  Mihai: 'mveres',
  'Alex Bancu': 'bancualex',
  Andres: 'aoviedob',
  'Cristi Luca': 'cristiLuca',
  'Farid Escate': 'faridescate',
  'Tamás Wagner': 'wagner89',
  'Wagner Tamas': 'wagner89',
};

const inferTagFromCommit = (commit, availableTags) => {
  const commitLowerCased = (commit.subject || '').toLowerCase();
  const matchesAFix = !!commitLowerCased.match(/\bfix\b/ || commitLowerCased.match(/\bbug fix\b/));
  const matchesARef = !!(commitLowerCased.match(/\bref\b/) || commitLowerCased.match(/\brefactor\b/));

  if (matchesAFix) return { tagId: 'FIX', tagName: availableTags.FIX };
  if (matchesARef) return { tagId: 'REF', tagName: availableTags.REF };

  const { tagId, tagName } = commit;

  return { tagId, tagName };
};

module.exports = {
  changelogx: {
    processTags: tags => {
      const oTags = (tags || []).filter(t => {
        const { TAGS_FILTER } = process.env;
        if (TAGS_FILTER) {
          return t.indexOf(TAGS_FILTER) > -1;
        }
        return true;
      });

      const result = oTags.slice(0, 100);
      return result;
    },
    ignoreRegExp: ['BLD: Release', 'DOC: Generate Changelog', 'Generated Changelog'],
    issueIDRegExp: 'CPM-(\\d+)',
    commitURL: 'https://github.com/redisrupt/rxp/commit/{0}',
    authorURL: 'https://github.com/{0}',
    issueIDURL: match => `https://redisrupt.atlassian.net/browse/${match}`,
    projectName: 'rxp',
    processCommit: (entry, { commitTags }) => {
      const commit = entry.commit || {};
      entry.author = usersHash[entry.author] || entry.author;

      if (!commit.tagId || commit.tagId === 'NC') {
        entry.commit = {
          ...commit,
          ...inferTagFromCommit(commit, commitTags),
        };
      }
      return entry;
    },
  },
};
