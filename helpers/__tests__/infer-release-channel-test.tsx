import { inferReleaseChannelFromHostname } from '../infer-release-channel';

describe('infer-release-channel-test', () => {
  describe('when hostname is a valid host name', () => {
    it('should infer the releaseChannel from the hostname', () => {
      const releaseChannel = inferReleaseChannelFromHostname('test1.local.env.reva.tech');
      expect(releaseChannel).toBe('local');

      const releaseChannel2 = inferReleaseChannelFromHostname('resident.test1.env.reva.tech');
      expect(releaseChannel2).toBe('test1');

      const releaseChannel3 = inferReleaseChannelFromHostname('resident.reva.tech');
      expect(releaseChannel3).toBe('prod');
    });

    describe('except when hostname is an ip or localhost', () => {
      it('should return undefined', () => {
        const releaseChannel = inferReleaseChannelFromHostname('localhost');
        expect(releaseChannel).toBeUndefined();

        const releaseChannel2 = inferReleaseChannelFromHostname('10.0.0.28');
        expect(releaseChannel2).toBeUndefined();
      });
    });
  });
});
