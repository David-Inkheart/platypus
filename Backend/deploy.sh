#!/bin/bash

echo What should the version be?

read VERSION

sudo docker build -t davidokolie/platypus:$VERSION .

sudo docker push davidokolie/platypus:$VERSION

ssh root@165.22.66.245 "docker pull davidokolie/platypus:$VERSION && docker tag davidokolie/platypus:$VERSION dokku/api:$VERSION && dokku git:from-image api dokku/api:$VERSION"