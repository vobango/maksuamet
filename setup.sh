#!/usr/bin/env bash
## We need environmental variables in ~/.env

if [ "$1" == "init" ]; then
  git clone https://github.com/vobango/maksuamet.git
  git clone https://github.com/vobango/maksuamet-fe.git
  cd maksuamet || echo "Git clone failed"; exit 1 ;
  cp ../.env ./
  docker-compose -f docker-compose.yaml up -d
fi;

if [ "$1" == "update" ] || [ "$1" == "" ]; then
  cd ../maksuamet-fe || echo "No such dir $?"; exit 1 ;
  git pull
  cd ../maksuamet || echo "No such dir $?"; exit 1 ;
  git pull
  cp ../.env ./
  docker-compose -f ./maksuamet/docker-compose.yaml up -d
fi;
