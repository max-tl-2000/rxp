import { appStackFullPathsMap } from '../routes';

export const getAppScreenNameByPath = (path: string) => {
  const appScreens: any = Object.keys(appStackFullPathsMap).reduce(
    (acc, key) => ({ ...acc, [appStackFullPathsMap[key]]: key }),
    {},
  );
  return appScreens[path];
};
