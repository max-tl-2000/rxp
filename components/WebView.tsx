import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';
import { ActivityIndicator } from 'react-native-paper';
import { isWeb, NetInfoConfig } from '../config';
import { tryParse } from '../helpers/json';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});

interface Props {
  uri: string;
  title: string;
  onAction: (action: string, payload?: { userId: string; paymentMethodId: string }) => void;
}

export const WebView = ({ onAction, title, uri }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleMessage = (event: any) => {
    let message: undefined | { action: string; payload: { userId: string; paymentMethodId: string } };

    if (isWeb && event?.data?.message) {
      message = tryParse(event.data.message);
    }

    if (!isWeb && event?.nativeEvent?.data) {
      message = tryParse(event.nativeEvent.data);
    }

    if (message) onAction(message.action, message.payload);
  };

  useEffect(() => {
    let timeoutHandle: NodeJS.Timeout;
    if (uri) {
      timeoutHandle = setTimeout(() => {
        if (isLoading) onAction('requestTimeout');
      }, NetInfoConfig.reachabilityRequestTimeout);
    }

    return () => clearTimeout(timeoutHandle);
  }, [uri, isLoading]);

  useEffect(() => {
    if (isWeb && window.addEventListener) {
      window.addEventListener('message', handleMessage, false);
    }
    return () => {
      isWeb && window.removeEventListener('message', handleMessage);
    };
  }, []);

  const displayStyle = { display: isLoading ? 'none' : 'flex' };

  // TODO: address this comment - https://github.com/Redisrupt/rxp/pull/226#discussion_r499231448
  const iframe = isWeb ? (
    <iframe
      title={title}
      src={uri}
      height="100%"
      width="100%"
      onLoad={() => setIsLoading(false)}
      frameBorder="0"
      style={displayStyle}
    />
  ) : (
    <RNWebView
      scalesPageToFit
      bounces={false}
      javaScriptEnabled
      containerStyle={displayStyle as ViewStyle}
      onLoad={() => setIsLoading(false)}
      onMessage={handleMessage}
      source={{ uri }}
      // TODO: set originWhiteList
      // originWhitelist={['https://*']}
    />
  );

  return (
    <>
      {!!uri && iframe}
      {isLoading && (
        <View style={styles.content}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
};
