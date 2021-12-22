#!/usr/bin/env bash

if [ "$1" == "init" ]; then
  git clone https://github.com/vobango/maksuamet.git
  git clone https://github.com/vobango/maksuamet-fe.git
  cd maksuamet || echo "Git clone failed"; exit 1 ;
  docker-compose -f docker-compose.yaml up -d
fi;

if [ "$1" == "update" ] || [ "$1" == "" ]; then
  cd ..
  git pull https://github.com/vobango/maksuamet.git
  git pull https://github.com/vobango/maksuamet-fe.git
  docker-compose -f ./maksuamet/docker-compose.yaml up -d
fi;
