/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import checker from 'license-checker'; // eslint-disable-line import/no-extraneous-dependencies
import { read, write } from './xfs';

type LicenseMap = {
  [key: string]: string;
};

const readLicenseFile = (name: string, licenseFile: string) => {
  const map: LicenseMap = {
    'react-native-web': './resources/hard-coded-licenses/react-native-web.txt',
    'moment-range': './resources/hard-coded-licenses/moment-range.txt',
    '@react-native-community/masked-view': './resources/hard-coded-licenses/mit.txt',
    'babel-plugin-inline-dotenv': './resources/hard-coded-licenses/isc.txt',
    'i18n-js': './resources/hard-coded-licenses/mit.txt',
  };

  let fileToRead = map[name] ?? licenseFile;

  if (name.match(/^expo/)) {
    fileToRead = './resources/hard-coded-licenses/mit.txt';
  }

  if (!fileToRead) return '';

  if (fileToRead.match(/README$|README\.MD$/i)) return '';

  return read(fileToRead);
};

type PkgInfo = {
  name: string;
  repository: string;
  version: string;
  licenseText: string;
  licenses: string;
  publisher: string;
  email: string;
  type: string;
};

const addLicenseInfoToPkg = async (pkg: PkgInfo, licenseFile: string) => {
  const licenseText = await readLicenseFile(pkg.name, licenseFile);

  return {
    ...pkg,
    licenseText,
  };
};

type DepMap = {
  [key: string]: string;
};

type Matcher = {
  regex: RegExp;
  name: string;
};

const mapByRegex: Matcher[] = [
  {
    regex: /^@react-native-community\//g,
    name: 'react-native-community',
  },
  {
    regex: /^@babel\//g,
    name: 'babel',
  },
  {
    regex: /^@expo\//g,
    name: 'expo',
  },
  {
    regex: /^@hapi\//g,
    name: 'hapi',
  },
];

const getGroupName = (pkg: PkgInfo): string => {
  const moduleGroupByRepo: DepMap = {
    'https://github.com/DefinitelyTyped/DefinitelyTyped': 'DefinitelyTyped',
    'https://github.com/Reactive-Extensions/RxJS': 'RxJS',
    'https://github.com/expo/vector-icons': 'expo',
    'https://github.com/expo/expo': 'expo',
    'https://github.com/react-navigation/react-navigation': 'react-navigation',
    'https://github.com/react-navigation/react-navigation/tree/master/packages/drawer': 'react-navigation',
    'https://github.com/react-navigation/react-navigation-web': 'react-navigation',
    'https://github.com/babel/babel': 'babel',
    'https://github.com/facebook/fbjs': 'fbjs',
    'https://github.com/facebook/jest': 'jest',
    'https://github.com/facebook/metro': 'metro',
    'https://github.com/facebook/react': 'react',
    'https://github.com/facebook/watchman': 'watchman',
    'https://github.com/lodash/lodash': 'lodash',
    'https://github.com/necolas/react-native-web': 'react-native-web',
    'https://github.com/zloirock/core-js': 'core-js',
  };

  const groupName = moduleGroupByRepo[pkg.repository];

  if (groupName) {
    return groupName;
  }

  const match: Matcher | undefined = mapByRegex.find(entry => {
    return !!pkg.name.match(entry.regex);
  });

  if (match) {
    return match.name;
  }

  return pkg.name;
};

const createSingleEntry = (pkg: PkgInfo & { licenseFile: string }) => {
  const { name, version, licenseText, repository, licenses, publisher, email, licenseFile } = pkg;
  return addLicenseInfoToPkg(
    { name, version, licenseText, repository, licenses, publisher, email, type: 'single' },
    licenseFile,
  );
};

const processPackages = async (packages: any) => {
  const dependenciesMap = new Map();
  const packagesNames = Object.keys(packages);

  for (let i = 0; i < packagesNames.length; i++) {
    const moduleIdentifier = packagesNames[i];
    const moduleIdentifierParts = moduleIdentifier.split(/@/g);

    const version = moduleIdentifierParts.pop() || '';
    const name: string = moduleIdentifierParts.join('@');

    const pkg = {
      ...packages[moduleIdentifier],
      name,
      version,
    };

    const groupName = getGroupName(pkg);
    let entry = dependenciesMap.get(groupName);

    if (!entry) {
      entry = await createSingleEntry(pkg);
      dependenciesMap.set(groupName, entry);
    } else {
      const newEntry = await createSingleEntry(pkg);
      if (entry.type === 'single') {
        entry = { name: groupName, type: 'group', deps: [entry] };
        dependenciesMap.set(groupName, entry);
      }
      entry.deps.push(newEntry);
    }
  }

  const packagesInfo = Array.from(dependenciesMap.values());

  await write('./backend/assets/pkgs-metadata/attribution-list.json', JSON.stringify(packagesInfo));
};

const generateLicenseInfo = () => {
  checker.init(
    {
      start: './',
      production: true,
      excludePrivatePackages: true,
    },
    async (err: Error, packages: object) => {
      if (err) {
        console.error('>>> error generating license metadata');
      } else {
        await processPackages(packages);
      }
    },
  );
};

generateLicenseInfo();
