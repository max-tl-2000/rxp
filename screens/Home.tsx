import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ListRenderItemInfo, RefreshControl, ViewToken, View } from 'react-native';
import { useObserver } from 'mobx-react-lite';
import { useFocusEffect } from '@react-navigation/native';

import { throttle } from 'lodash';
import { t } from '../i18n/trans';
import { HomeScreenNavigationProp } from '../types';
import { PostCard, Screen, FlatList, Pictograph, Caption } from '../components';
import { useStores } from '../mobx/useStores';
import { Post as PostType } from '../mobx/stores/postTypes';
import { defaultThrottleTime } from '../config';
import { isDefaultPost, DEFAULT_POSTS } from '../helpers/post';

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
    marginVertical: 40,
  },
  captionText: {
    textAlign: 'center',
  },
});

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const Home = ({ navigation }: Props) =>
  useObserver(() => {
    const { post: postStore, userSettings } = useStores();
    const [lastUnreadPost, setlastUnreadPost] = useState(-1);

    useEffect(() => {
      const unreads = postStore.sortedPosts.filter(post => post.unread);
      if (unreads.length && unreads.length !== postStore.sortedPosts.length) {
        const last = unreads[unreads.length - 1];
        const indexOfpost = postStore.sortedPosts.findIndex(post => post.id === last?.id);
        setlastUnreadPost(indexOfpost);
      } else {
        setlastUnreadPost(-1);
      }
    }, [postStore.posts]);

    const markViewableItems = throttle(
      (viewableItems: ViewToken[]) => {
        const idsToMark = viewableItems
          .filter(vItem => vItem.isViewable && vItem.item.unread)
          .map(item => item.item.id);

        if (idsToMark.length) {
          postStore.markPostsAsRead(idsToMark);
        }
      },
      defaultThrottleTime,
      { trailing: true, leading: false },
    );

    useEffect(() => {
      postStore.getPosts();
    }, [userSettings.selectedPropertyId]);

    useFocusEffect(
      React.useCallback(() => {
        // Similarly to React's useEffect that must return the function to call when the component un-mounts
        // this must return the function to call when the component loses focus.
        // Expected behavior is to mark posts as read when the screen loses focus.

        return postStore.updateMarkedPostsAsRead();
      }, []),
    );

    const [wasScrolledDown, setWasScrolledDown] = useState(false);

    const refreshControl = () => (
      <RefreshControl onRefresh={postStore.getPosts} refreshing={postStore.loadingPostsInProgress} />
    );

    const viewabilityConfigCallbackPairs = useRef([
      {
        viewabilityConfig: {
          minimumViewTime: 1000,
          itemVisiblePercentThreshold: 70,
        },
        onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
          if (!navigation.isFocused()) return;
          const unreads = postStore.sortedPosts.filter(post => post.unread);
          const last = unreads[unreads.length - 1];
          if (last?.id) {
            const lastPostViewable = viewableItems.filter(viewableItem => viewableItem.item?.id === last?.id);
            markViewableItems(lastPostViewable);
          }
        },
      },
      {
        viewabilityConfig: {
          minimumViewTime: 1000,
          itemVisiblePercentThreshold: 100,
        },
        onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
          if (!navigation.isFocused()) return;
          markViewableItems(viewableItems);
        },
      },
    ]);

    const onPostCardPress = (postId: string) => {
      postStore.setViewingPost(postId);
      if (!isDefaultPost(postId)) postStore.markPostAsClicked(postId);

      navigation.navigate('PostDetails');
    };

    const renderItem = ({ item, index }: ListRenderItemInfo<PostType>) => {
      return (
        <PostCard
          post={item}
          onPress={onPostCardPress}
          isFirstCard={index === 0}
          lastUnreadPost={index === lastUnreadPost}
        />
      );
    };

    const renderEmptyStateView = () => {
      return (
        <View>
          <View style={styles.emptyStateContainer}>
            <Pictograph type="speech-bubble" />
            <Caption style={styles.captionText}>{t('HOME_EMPTY_STATE_TEXT')}</Caption>
          </View>
          <PostCard post={DEFAULT_POSTS[0]} onPress={onPostCardPress} />
        </View>
      );
    };

    return (
      <Screen title={t('HOME')} navigation={navigation} hideAppBar={wasScrolledDown}>
        {!postStore.loadingPostsInProgress && (
          <FlatList
            ListFooterComponent={renderEmptyStateView()}
            data={postStore.sortedPosts}
            renderItem={renderItem}
            keyExtractor={(item: any) => userSettings.selectedPropertyId + item.id}
            contentContainerStyle={styles.content}
            scrollEnabled
            refreshControl={refreshControl()}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            onVerticalScroll={(down: boolean) => setWasScrolledDown(down)}
          />
        )}
      </Screen>
    );
  });
