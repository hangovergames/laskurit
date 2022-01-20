#!/bin/bash
set -e
set -x
PUBLIC_URL='https://hangovergames.github.io/laskurit/' npm run build
rsync -av --delete build/ docs/
git add ./docs
