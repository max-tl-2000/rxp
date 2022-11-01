import React, { useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle, ListRenderItemInfo, RefreshControl, FlatList, View, TextStyle } from 'react-native';
import { useObserver } from 'mobx-react-lite';
import { merge } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';

import { t } from '../i18n/trans';
import { Message, MessageInput, Screen, Caption, Pictograph } from '../components';
import { MessagesScreenNavigationProp } from '../types';
import { useStores } from '../mobx/useStores';
import { IMessage, MessageDirection } from '../mobx/stores/message';
import { colors } from '../constants/colors';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  messagesContainer: ViewStyle;
  contentContainer: ViewStyle;
  emptyStateContainer: ViewStyle;
  captionText: TextStyle;
}

const createStyles = (isWideScreen: boolean, hasConversationStarted: boolean) => {
  const baseStyles: Styles = {
    contentContainer: {
      backgroundColor: colors.white,
      justifyContent: hasConversationStarted ? 'flex-end' : 'space-between',
      zIndex: -1,
    },
    messagesContainer: {
      padding: 8,
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 60,
      marginVertical: 40,
    },
    captionText: {
      textAlign: 'center',
      marginTop: 24,
    },
  };
  const wideScreenStyles: Partial<Styles> = {
    messagesContainer: {
      paddingHorizontal: 10,
    },
  };

  return StyleSheet.create(merge(baseStyles, isWideScreen && wideScreenStyles));
};

interface Props {
  navigation: MessagesScreenNavigationProp;
  route: { params?: { scrollToLatest?: boolean } };
}

const renderItem = ({ item }: ListRenderItemInfo<IMessage>) => <Message message={item} />;

export const Messages = ({ navigation, route }: Props) =>
  useObserver(() => {
    const listRef = useRef<FlatList>(null);
    const { messages: messagesStore, screenSize, userSettings } = useStores();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';

    const hasConversationStarted = !!messagesStore.messages.length;
    const styles = createStyles(screenSize.matchMedium, hasConversationStarted);

    const markMessagesAsRead = () => {
      const idsToMark = messagesStore.messages
        .filter(message => message.unread && message.direction === MessageDirection.Out)
        .map(item => item.id);
      if (idsToMark.length) {
        messagesStore.markMessagesAsRead(idsToMark);
      }
    };

    useEffect(() => {
      if (route.params?.scrollToLatest && !messagesStore.loadingMessagesInProgress)
        // timeout to make sure the flatlist ref is bound
        setTimeout(() => listRef.current?.scrollToIndex({ animated: true, index: 0, viewPosition: 1 }), 1000);
    }, [route.params, messagesStore.loadingMessagesInProgress]);

    useEffect(() => {
      messagesStore.getMessages();
    }, [userSettings.selectedPropertyId]);

    useEffect(() => {
      if (navigation.isFocused()) markMessagesAsRead();
    }, [messagesStore.newestMessageId]);

    useFocusEffect(React.useCallback(() => markMessagesAsRead(), []));

    const refreshControl = () => (
      <RefreshControl onRefresh={messagesStore.getMessages} refreshing={messagesStore.loadingMessagesInProgress} />
    );

    const renderEmptyStateView = () => {
      return (
        <View style={styles.emptyStateContainer}>
          <Pictograph type="envelope" />
          <Caption style={styles.captionText}>{t('MESSAGES_EMPTY_STATE_TEXT')}</Caption>
        </View>
      );
    };

    return (
      <Screen
        title="Messages"
        navigation={navigation}
        hasInputs
        contentContainerStyle={styles.contentContainer}
        contentInSafeView
        useTwoToneBackground={isDark}
        addPadding={false}
      >
        {messagesStore.areMessagesLoaded && hasConversationStarted && (
          <FlatList
            ListFooterComponent={renderEmptyStateView()}
            ref={listRef}
            data={messagesStore.messages}
            renderItem={renderItem}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.messagesContainer}
            refreshControl={refreshControl()}
            scrollEnabled
            inverted
            disableVirtualization
          />
        )}
        {messagesStore.areMessagesLoaded && !hasConversationStarted && renderEmptyStateView()}
        <MessageInput onSendMessage={messagesStore.sendMessage} />
      </Screen>
    );
  });
