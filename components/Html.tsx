import React from 'react';
import { StyleSheet, GestureResponderEvent, View } from 'react-native';
import HTML from 'react-native-render-html';
import { Text } from 'react-native-paper';
import { isIOS } from '../config';
import { openLinkHandler } from '../helpers/openLinkHandler';
import { useAppTheme } from '../hooks/use-app-theme';

import { colors } from '../constants/colors';
import { Picture } from './Picture';
import { generateId } from '../helpers/generateId';
import { logger } from '../helpers/logger';
import { VideoWebView } from './VideoWebView';

interface HtmlProps {
  content: string;
  onLinkVisited?: (link: string) => void;
}

const createStyles = (isDarktheme: boolean) => {
  const styles = StyleSheet.create({
    listItemDecorator: {
      color: isDarktheme ? colors.white : colors.black,
      fontWeight: '500',
      fontSize: 13,
    },
    liDecoratorContainer: {
      justifyContent: 'center',
      width: 20,
      height: 20,
    },
    listContainer: {
      marginVertical: 10,
    },
    listItem: {
      flex: 1,
      flexDirection: 'row',
    },
    childContainer: {
      flex: 2,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.red400,
      paddingLeft: 24,
      flex: 1,
      marginVertical: 8,
    },
    dividerContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 34,
    },
    dividerDot: {
      color: colors.grey400,
      fontSize: 34,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
  });

  return styles;
};

export const Html = (props: HtmlProps): JSX.Element => {
  const { content, onLinkVisited } = props;
  const { dark, colors: themeColors } = useAppTheme();
  const styles = createStyles(dark);

  const renderListItem = ({
    child,
    listItemDecorator,
    key,
  }: {
    child: any;
    listItemDecorator: string;
    key: string;
  }) => {
    return (
      <View key={key} style={styles.listItem}>
        <View style={[styles.liDecoratorContainer]}>
          <Text style={[styles.listItemDecorator]}>{listItemDecorator}</Text>
        </View>
        <View style={styles.childContainer}>{child}</View>
      </View>
    );
  };

  const onRequestTimeoutVideoWebView = () => {
    logger.warn('Video webView has a request timeout');
  };

  const renderers = {
    img(htmlAttribs: any, children: any, convertedCSSStyles: any) {
      const key = generateId(Picture);
      return (
        <Picture key={key} src={htmlAttribs.src} style={convertedCSSStyles} sizeScale={convertedCSSStyles?.width} />
      );
    },
    ol(htmlAttribs: any, children: any) {
      const olKey = htmlAttribs['data-offset-key'];
      return (
        <View style={styles.listContainer} key={olKey}>
          {children.map((child: any, index: number) =>
            renderListItem({ child, listItemDecorator: `${index + 1}.`, key: `${olKey}-ol-li-${index}` }),
          )}
        </View>
      );
    },
    ul(htmlAttribs: any, children: any) {
      const ulKey = htmlAttribs['data-offset-key'];

      return (
        <View style={styles.listContainer} key={ulKey}>
          {children.map((child: any, index: number) =>
            renderListItem({
              child,
              listItemDecorator: ' \u2022',
              key: `${ulKey}-ul-li-${index}`,
            }),
          )}
        </View>
      );
    },
    blockquote(htmlAttribs: any, children: any) {
      const key = htmlAttribs['data-offset-key'];

      return (
        <View key={key} style={styles.blockquote}>
          <View style={styles.childContainer}>{children}</View>
        </View>
      );
    },
    hr(htmlAttribs: any) {
      const key = htmlAttribs['data-offset-key'];
      return (
        <View key={key} style={styles.dividerContainer}>
          <Text style={styles.dividerDot}>{`\u2022`}</Text>
          <Text style={styles.dividerDot}>{`\u2022`}</Text>
          <Text style={styles.dividerDot}>{`\u2022`}</Text>
        </View>
      );
    },
    iframe(htmlAttribs: any) {
      const key = generateId(VideoWebView);
      return (
        <VideoWebView
          key={key}
          title={`video-${key}`}
          uri={htmlAttribs.src}
          onRequestTimeout={onRequestTimeoutVideoWebView}
        />
      );
    },
  };
  const formatHtml = `<div class="container">${content}</div>`;

  return (
    <HTML
      html={formatHtml}
      onLinkPress={(evt: GestureResponderEvent, href: string) => {
        onLinkVisited && onLinkVisited(href);
        openLinkHandler(href, true);
      }}
      renderers={renderers}
      tagsStyles={{
        a: { color: colors.blue300 },
        h1: { lineHeight: 35, fontSize: 18 },
        h2: { lineHeight: 35, fontSize: 15 },
        h3: { lineHeight: 35 },
        h5: { lineHeight: 35 },
        h6: { lineHeight: 35 },
      }}
      classesStyles={{
        container: { fontSize: 13, lineHeight: 20, color: themeColors.placeholder },
        draftJsEmojiPluginEmojiContainer: {
          paddingHorizontal: 1,
        },
        codeBlock: { fontFamily: isIOS ? 'Courier' : 'monospace' },
      }}
    />
  );
};
