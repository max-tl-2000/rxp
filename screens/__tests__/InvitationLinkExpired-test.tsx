import * as React from 'react';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { InvitationLinkExpired } from '../InvitationLinkExpired';
import { MobxStoresContext, createMobxStores } from '../../mobx/storeContext';

jest.mock('../../components/AppBranding', () => {
  const { View } = require('react-native'); // eslint-disable-line
  return {
    AppBranding() {
      return <View />;
    },
  };
});

jest.mock('@react-navigation/stack', () => ({
  useHeaderHeight: () => 62,
}));

describe('InvitationLinkExpired', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('renders the InvitationLinkExpired component', async () => {
    let resolve: (value: ReactTestRenderer) => void;

    const renderPromise: Promise<ReactTestRenderer> = new Promise(r => {
      resolve = r;
    });

    await act(async () =>
      resolve(
        renderer.create(
          <MobxStoresContext.Provider value={createMobxStores()}>
            <InvitationLinkExpired />
          </MobxStoresContext.Provider>,
        ),
      ),
    );

    const rdr = await renderPromise;
    expect(rdr.toJSON()).toMatchSnapshot();
  });
});
