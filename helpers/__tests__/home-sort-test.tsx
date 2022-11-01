import { sortPosts } from '../home-sort';
import { postsDataForTesting } from '../test-data/posts-for-sorting';

describe('HomeFeed-sort', () => {
  describe('when we have all kinds of posts (read/unread, alerts/announcements, retracted, new/older than 24h)', () => {
    it('should return the posts sorted in such way that the order it should correspond with the post.id', () => {
      sortPosts(postsDataForTesting).forEach((post, index) => expect(post.id).toEqual(index.toString()));
    });
  });
});
