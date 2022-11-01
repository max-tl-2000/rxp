/* eslint-disable global-require */
describe('config', () => {
  beforeAll(() => {
    jest.mock('expo-updates', () => {
      return { updateId: null };
    });

    jest.mock('expo-device', () => {
      return { Device: { osName: 'iOS' } };
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  describe('config flags', () => {
    it('should set the isWeb flag to true when on web', () => {
      jest.mock('expo-constants', () => {
        return { manifest: { android: {}, ios: {}, extra: {} } };
      });

      jest.mock('react-native', () => {
        return { Platform: { OS: 'web' } };
      });

      const { isWeb, isAndroid, isIOS } = require('../config');

      expect({ isAndroid, isIOS, isWeb }).toMatchSnapshot();
    });

    it('should set the isAndroid flag to true when on android', () => {
      jest.mock('expo-constants', () => {
        return { manifest: { android: {}, ios: {}, extra: {} } };
      });

      jest.mock('react-native', () => {
        return { Platform: { OS: 'android' } };
      });

      const { isWeb, isAndroid, isIOS } = require('../config');

      expect({ isAndroid, isIOS, isWeb }).toMatchSnapshot();
    });

    it('should set the isIOS flag to true when on ios', () => {
      jest.mock('expo-constants', () => {
        return { manifest: { android: {}, ios: {}, extra: {} } };
      });

      jest.mock('react-native', () => {
        return { Platform: { OS: 'ios' } };
      });

      const { isWeb, isAndroid, isIOS } = require('../config');

      expect({ isAndroid, isIOS, isWeb }).toMatchSnapshot();
    });
  });

  describe('when process.env.RXP_CLOUD_ENV is set and no releaseChannel is set', () => {
    it('should set cloudEnv to the value of RXP_CLOUD_ENV', () => {
      jest.mock('../helpers/env', () => {
        return { rxpCloudEnv: 'staging' };
      });

      jest.mock('expo-constants', () => {
        return { manifest: { android: {}, ios: {}, extra: {} } };
      });

      jest.mock('react-native', () => {
        return { Platform: { OS: 'web' } };
      });

      jest.mock('../helpers/globals.ts', () => {
        return { location: { hostname: 'localhost' } };
      });

      const { cloudEnv } = require('../config');

      expect(cloudEnv).toEqual('staging');
    });
  });

  it('should set cloudEnv to local if no RXP_CLOUD_ENV var is set', () => {
    jest.mock('../helpers/env', () => {
      return { rxpCloudEnv: undefined };
    });

    jest.mock('expo-constants', () => {
      return {};
    });

    jest.mock('react-native', () => {
      return { Platform: { OS: 'web' } };
    });

    jest.mock('../helpers/globals.ts', () => {
      return { location: { hostname: 'localhost' } };
    });

    const { cloudEnv } = require('../config');

    expect(cloudEnv).toEqual('local');
  });

  it('appId should be "resident" in case of web', () => {
    jest.mock('../helpers/env', () => {
      return { rxpCloudEnv: undefined };
    });

    jest.mock('expo-constants', () => {
      return {};
    });

    jest.mock('react-native', () => {
      return { Platform: { OS: 'web' } };
    });

    jest.mock('../helpers/globals.ts', () => {
      return { location: { hostname: 'localhost' } };
    });

    const { appId } = require('../config');

    expect(appId).toEqual('resident');
  });

  it('appId should be "{package}" without the env modifier in case of android', () => {
    jest.mock('../helpers/env', () => {
      return { rxpCloudEnv: undefined };
    });

    jest.mock('expo-constants', () => {
      return { manifest: { android: { package: 'com.maximus.rxp.local' } } };
    });

    jest.mock('react-native', () => {
      return { Platform: { OS: 'android' } };
    });

    const { appId } = require('../config');

    expect(appId).toEqual('com.maximus.rxp');
  });

  it('appId should be "{bundleIdentifier}" without the env modifier in case of ios', () => {
    jest.mock('../helpers/env', () => {
      return { rxpCloudEnv: undefined };
    });

    jest.mock('expo-constants', () => {
      return { manifest: { ios: { bundleIdentifier: 'com.maximus.rxp.local' } } };
    });

    jest.mock('react-native', () => {
      return { Platform: { OS: 'ios' } };
    });

    const { appId } = require('../config');

    expect(appId).toEqual('com.maximus.rxp');
  });

  describe('appId should be exactly the value of package or bundleIdentifier if in prod releaseChannel', () => {
    it('appId should be "{package}" without the env modifier in case of android', () => {
      jest.mock('../helpers/env', () => {
        return { rxpCloudEnv: undefined };
      });

      jest.mock('expo-constants', () => {
        return { manifest: { releaseChannel: 'prod', android: { package: 'com.maximus.rxp' } } };
      });

      jest.mock('react-native', () => {
        return { Platform: { OS: 'android' } };
      });

      const { appId } = require('../config');

      expect(appId).toEqual('com.maximus.rxp');
    });

    it('appId should be "{bundleIdentifier}" without the env modifier in case of ios', () => {
      jest.mock('../helpers/env', () => {
        return { rxpCloudEnv: undefined };
      });

      jest.mock('expo-constants', () => {
        return { manifest: { releaseChannel: 'prod', ios: { bundleIdentifier: 'com.maximus.rxp' } } };
      });

      jest.mock('react-native', () => {
        return { Platform: { OS: 'ios' } };
      });

      const { appId } = require('../config');

      expect(appId).toEqual('com.maximus.rxp');
    });
  });
});
