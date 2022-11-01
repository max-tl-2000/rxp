# rxp

## Steps to run:
- git clone
- run `./configure.sh`
- yarn start
- have a ios and/or android simulator running
- follow terminal instructions: `i` to open on iOS, `a` for android, `w` for web

## Publish to web

```bash
# execute
# ./publish-web.sh [--bump=[BUMP_VERSION]] [--tag=[TAG]] [--preid=[PRE_ID]] [--remote=[REMOTE]]
#
# by default if called without parameters this will be the values
#
# - BUMP_VERSION=prerelease
# - TAG=alpha
# - PRE_ID=alpha
# - REMOTE=origin

# Example:

./publish-web.sh --bump=patch --tag=latest --remote=upstream
```