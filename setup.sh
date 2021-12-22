#!/usr/bin/env bash
## We need environmental variables in ~/.env

#update
if [ "$1" == "update" ] || [ "$1" == "" ]; then
  cd ../maksuamet-fe || echo "No such dir $?"; exit 1 ;
  git pull
  cd ../maksuamet || echo "No such dir $?"; exit 1 ;
  git pull
  cp ../.env ./
  docker-compose -f ./maksuamet/docker-compose.yaml up -d
fi;
