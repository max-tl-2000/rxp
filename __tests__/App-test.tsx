import * as React from 'react';
import NavigationTestUtils from 'react-navigation/NavigationTestUtils';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';

jest.mock('expo', () => ({
  AppLoading: 'AppLoading',
  SplashScreen: {
    preventAutoHide: jest.fn(),
  },
  Linking: {
    parse: () => '',
    getInitialURL: () => '',
  },
}));

jest.mock('../navigation/useLinking', () => ({ useLinking: () => ({ getInitialState: jest.fn() }) }));

jest.mock('../helpers/console-trap', () => ({}));

jest.mock('../components/AppBranding', () => {
  const { View } = require('react-native'); // eslint-disable-line
  return {
    AppBranding() {
      return <View />;
    },
  };
});

const App = require('../App').default; // eslint-disable-line

describe('App', () => {
  beforeEach(() => {
    NavigationTestUtils.resetInternalState();
    jest.useFakeTimers();
  });

  it('renders the root', async () => {
    let resolve: (value: ReactTestRenderer) => void;

    const renderPromise: Promise<ReactTestRenderer> = new Promise(r => {
      resolve = r;
    });

    await act(() => resolve(renderer.create(<App />)));

    const rdr = await renderPromise;
    expect(rdr.toJSON()).toMatchSnapshot();
  });
});
