#!/usr/bin/env bash
## We need environmental variables in ~/.env

#update
if [ "$1" == "update" ] || [ "$1" == "" ]; then
  docker stop "$(docker ps -a -q)"
  docker rm "$(docker ps -a -q)"
  cd ../maksuamet-fe || echo "No such dir $?";
  git pull
  cd ../maksuamet || echo "No such dir $?";
  git pull
  cp ../.env ./
  docker-compose up --force-recreate --build -d
  docker image prune -f
  rm -f .env
fi;
