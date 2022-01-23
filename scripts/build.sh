#!/bin/bash
set -e
set -x
#PUBLIC_URL='https://laskurit.heusalagroup.fi/'
npm run build
rsync -av --delete build/ docs/
git add ./docs
