#!/bin/bash

echo "Publishing QANDR signup page develop release to github and docker."

#Get the latest commit id from HEAD

if [[ `git status --porcelain` ]]; then
    echo "There are open changes, please commit to git first."
    exit 0
  else
    echo "Publishing to git."
fi

GIT_COMMIT_ID=$(git log -n 1 | head -n 1 | sed -e 's/^commit //' | head -c 8)
echo $GIT_COMMIT_ID

GIT_TAG=$npm_package_version

echo "Pushing tags to github"

git tag $GIT_TAG
git push origin --tags

echo "Building docker image"
docker build -f Dockerfile -t noterik/marin-portal-stageplayer-embed:$GIT_TAG .
echo "Publishing to docker hub"
docker push noterik/marin-portal-stageplayer-embed:$GIT_TAG