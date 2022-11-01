import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { isWeb } from '../config';
import { injectStyles } from '../helpers/inject-styles';

interface WrapperProps {
  children: React.ReactNode;
}

if (isWeb) {
  injectStyles({
    id: 'WebWordBreakWrapper',
    styles: `
      [word-break="break-word"] { word-break: break-word }
    `,
  });
}

export const WebWordBreakWrapper = ({ children }: WrapperProps): JSX.Element => {
  if (!isWeb) {
    return <>{children}</>;
  }
  const viewRef = useRef<View>(null);

  useEffect(() => {
    isWeb && viewRef?.current?.setNativeProps({ 'word-break': 'break-word' });
  }, [viewRef]);

  return <View ref={viewRef}>{children}</View>;
};
