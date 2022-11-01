import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';
import { isWeb, NetInfoConfig } from '../config';

const styles = StyleSheet.create({
  videoContainer: {
    marginVertical: 16,
    height: isWeb ? 350 : 200,
  },
});

interface Props {
  uri: string;
  title: string;
  onRequestTimeout?: () => void;
}

export const VideoWebView = ({ title, uri, onRequestTimeout }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutHandle: NodeJS.Timeout;
    if (uri) {
      timeoutHandle = setTimeout(() => {
        if (isLoading) onRequestTimeout?.();
      }, NetInfoConfig.reachabilityRequestTimeout);
    }

    return () => clearTimeout(timeoutHandle);
  }, [uri, isLoading]);

  const iframe = isWeb ? (
    <iframe title={title} src={uri} height="100%" width="100%" onLoad={() => setIsLoading(false)} frameBorder="0" />
  ) : (
    <RNWebView
      scalesPageToFit
      bounces={false}
      javaScriptEnabled
      onLoad={() => setIsLoading(false)}
      source={{ uri }}
      allowsFullscreenVideo
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction
    />
  );

  /* 
  In case that needs to be added a loading indicator, 
  was finding a issue with display 'none' that cause a fatal exception in Android
  */
  return <View style={[styles.videoContainer]}>{!!uri && iframe}</View>;
};
