import 'intl';
import 'intl/locale-data/jsonp/en';
import './helpers/console-trap';
import React, { useEffect, useCallback, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import * as Linking from 'expo-linking';
import debounce from 'lodash/debounce';
import { runInAction } from 'mobx';
import { Observer } from 'mobx-react-lite';

import { SplashScreen } from './components/SplashScreen';
import * as config from './config';
import { getTheme, Theme } from './helpers/theme';
import { AppNavigator } from './navigation/AppNavigator';
import { useLinking } from './navigation/useLinking';
import { navigationRef, navigate, setNavigationRefReady } from './navigation/RootNavigation';
import { OfflineState } from './screens';
import { initNetworkServices } from './network';
import { initFocusFix } from './helpers/focus-fix';
import { syncStorage } from './helpers/sync-storage/sync-storage';
import { initDeviceRegistration } from './helpers/device-registration';
import { onEmailTokenExpired } from './helpers/token';
import { mediator, initRequestHelper } from './network/helpers';
import { getAppScreenNameByPath } from './navigation/helpers/screen';
import { initTransactionsInterval } from './helpers/payments-recurring-tasks';
import { UnknownBrowserBanner } from './components/UnknownBrowserBanner';
import { logger } from './helpers/logger';
import { MobxStoresContext, createMobxStores } from './mobx/storeContext';
import {
  fetchUpdates,
  setNotificationStoreForOTAUpdates,
  notifyAboutLatestUpdateIfNecessary,
} from './helpers/ota-updates';
import {
  addNotificationListeners,
  removeNotificationListeners,
  initNotificationsBehavior,
} from './helpers/push-notifications';
import { isPublicWebRoute } from './helpers/isPublicWebRoute';

initRequestHelper();

initFocusFix();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const fontSources = {
  /* eslint-disable global-require */
  'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
  'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
  'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
  'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
  'Roboto-Thin': require('./assets/fonts/Roboto-Thin.ttf'),
  'Roboto-Italic': require('./assets/fonts/Roboto-Italic.ttf'),
  /* eslint-enable global-require */
};

const { isWeb, isIOS } = config;
const stores = createMobxStores();

// According to this issue https://github.com/expo/expo/issues/6943 on expo-notifications
// we need to bind the listeners very early in the lifecycle.
// If we bind them in App useEffect they won't fire when the app is closed and notification tapped.
addNotificationListeners(stores);

if (isWeb) {
  const win = window as any;
  // exporting for easy debugging (i.e.: check it is poiting to the correct server)
  win.rxpConfig = config;
  win.syncStorage = syncStorage;
  win.mobxStores = stores;
}

initNotificationsBehavior();

const App = () => {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [initialNavigationState, setInitialNavigationState] = useState<any>();
  const [isFetchingUpdates, setIsFetchingUpdates] = useState(false);
  const [theme, setTheme] = useState<Theme>();

  const { getInitialState } = useLinking(navigationRef as NavigationContainerRef & undefined);

  const { auth, settings, notification } = stores;

  const shouldForceLogout = (path: string | null) =>
    path?.includes('auth/registration') || path?.includes('auth/signInPassword') || path?.includes('auth/signIn');

  const shouldNotRequestLoginFlow = (path: string | null) => path?.includes('postPreview');

  const getInitialURLMetadata = (initialURL: string) => Linking.parse(initialURL || '');

  const handleDeepLinking = async (listenerURL?: string) => {
    const initialURL = listenerURL || (await Linking.getInitialURL());
    if (shouldNotRequestLoginFlow(initialURL)) return;

    let initialPath = '';
    if (initialURL) {
      const initialURLMetadata = getInitialURLMetadata(initialURL);
      const { queryParams, path } = initialURLMetadata;
      initialPath = path || '';

      const {
        emailToken = '',
        getAppUrl = '',
        appName = '',
        propertyId = '',
        tenantName = '',
        forceLogout = false,
        tenantId = '',
      } = queryParams || {};

      const hasToForceLogout = forceLogout || shouldForceLogout(path);

      if (hasToForceLogout) {
        // Force a logout by removing the `userData` from the `syncStorage`
        await syncStorage.entries.userData.clear();
      }

      await runInAction(async () => {
        settings.setSettingsFromParams({
          emailToken: emailToken as string,
          getAppUrl: getAppUrl as string,
          appName: appName as string,
          propertyId: propertyId as string,
          tenantName: tenantName as string,
          tenantId: tenantId as string,
        });
        settings.setInitialURL(initialURLMetadata);

        const isHandleDeepLinkInBackground = !!listenerURL;
        const shouldRestoreUserWhenAppIsOpened = auth.isSignedIn && isHandleDeepLinkInBackground && !hasToForceLogout;

        if (shouldRestoreUserWhenAppIsOpened) {
          await auth.restoreUser(syncStorage.fields.userData);
        }
      });
    }

    if (!auth.isSignedIn) {
      await settings.getLoginFlow(initialPath);
      if (syncStorage.fields.userData && settings.tokenEmail) {
        const { email: emailUserData } = syncStorage.fields.userData;
        emailUserData !== settings.tokenEmail && (await syncStorage.entries.userData.clear());
      }
    }
  };

  const RESPOND_TO_URL_CHANGES_THRESHOLD = 1000;
  // This will handle the urls when the app is open/background
  const handleDeepLinkInBackground = debounce(
    ({ url }: { url: string }) => handleDeepLinking(url),
    RESPOND_TO_URL_CHANGES_THRESHOLD,
    {
      leading: true,
    },
  );

  const WAIT_FOR_NAV_THRESHOLD = 100;
  const restoreInitialURL = () => {
    if (settings.initialURL) {
      const { path, queryParams } = settings.initialURL;
      const screen = getAppScreenNameByPath(path);
      if (!screen) return;
      settings.clearInitialURL();
      setTimeout(() => {
        navigate(screen, queryParams);
      }, WAIT_FOR_NAV_THRESHOLD);
    }
  };

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    const loadResourcesAndDataAsync = async () => {
      let willReloadToApplyUpdate = false;

      try {
        await syncStorage.load();

        onEmailTokenExpired(settings, () => navigate('ResetLinkExpired', {}));
        await handleDeepLinking();

        initDeviceRegistration();
        initTransactionsInterval();

        if (syncStorage.fields.userData && !isPublicWebRoute()) {
          await auth.restoreUser(syncStorage.fields.userData);
        }

        if (syncStorage.fields.wasDismissedUnknownBrowserBanner) {
          settings.restoreWasDismissedUnknownBrowserBanner(syncStorage.fields.wasDismissedUnknownBrowserBanner);
        }

        const initialState = await getInitialState();

        setInitialNavigationState(initialState);
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          ...fontSources,
        });

        setNotificationStoreForOTAUpdates(notification);
        await notifyAboutLatestUpdateIfNecessary();

        // IMPORTANT: No state changes after fetching update, app reload will fail and app will crash otherwise.
        willReloadToApplyUpdate = await fetchUpdates({ onFetchingUpdates: () => setIsFetchingUpdates(true) });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        logger.warn('loadResourcesAndDataAsync: ', e);
      } finally {
        if (!willReloadToApplyUpdate) {
          setLoadingComplete(true);
          if (!isWeb) {
            // this code is for the deepLinking and it should only be set in case of non web envs
            Linking.addEventListener('url', handleDeepLinkInBackground);
          }
        }
      }
    };

    mediator().subscribe('user:login', () => restoreInitialURL());
    initNetworkServices();
    loadResourcesAndDataAsync();

    // remove listeners when unmounted
    return () => {
      removeNotificationListeners();
    };
  }, []);

  const colorScheme = useColorScheme();

  const debounceSetupTheme = useCallback(
    debounce(
      colorMode => {
        const setupTheme = async () => setTheme(await getTheme(colorMode));
        setupTheme();
      },
      config.defaultDebounceTime,
      {
        leading: isWeb,
      },
    ),
    [],
  );

  useEffect(() => {
    debounceSetupTheme(colorScheme);
  }, [colorScheme]);

  if (!isLoadingComplete) {
    if (isWeb) {
      // IMPORTANT: Do not render anything before we have finished loading the app state
      //
      // if we render the content of the app without properly waiting for it to load
      // we will have to deal with all sort of issues.
      //
      // The removal of the splashscreen in the web introduced an issue that was
      // very hard to find because we were not aware the code was actually being executed
      // before we finalized the loading the app state
      return <View />;
    }
    return <SplashScreen showActivityIndicator={isFetchingUpdates} />;
  }

  return (
    <MobxStoresContext.Provider value={stores}>
      <AppearanceProvider>
        <PaperProvider theme={theme}>
          <View style={styles.container}>
            {isIOS && <StatusBar barStyle="default" />}
            {!isWeb && <OfflineState />}
            <Observer>
              {() => <>{isWeb && settings.shouldShowUnknownBrowserBanner && <UnknownBrowserBanner />}</>}
            </Observer>

            <NavigationContainer
              onReady={setNavigationRefReady}
              ref={navigationRef}
              initialState={initialNavigationState}
            >
              <AppNavigator />
            </NavigationContainer>
          </View>
        </PaperProvider>
      </AppearanceProvider>
    </MobxStoresContext.Provider>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
