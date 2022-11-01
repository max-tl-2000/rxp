/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  mergeBranches: {
    task: async ({ args }) => {
      const { mergeBranches } = require('./resources/merge-branches/merge-branches');
      const {
        branchesToMerge: branches,
        commitsToVerify,
        remote,
        ignoreMergeCheckOnBranches,
        featureBranches,
      } = require('./resources/merge-branches/merge-branches.config');
      await mergeBranches({ featureBranches, branches, commitsToVerify, remote, ignoreMergeCheckOnBranches, ...args });
    },
  },
};
