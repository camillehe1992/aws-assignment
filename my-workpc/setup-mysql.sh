#! /bin/bash

# https://hevodata.com/learn/docker-mysql/

# pull the docker image for mysql
docker pull mysql:latest

# setup local files for mysql container configuration
mkdir docker
mkdir docker/mysql
mkdir docker/mysql/conf.d
mkdir docker/mysql/data

# deploy and start mysql container
docker run \
  --name docker_mysql
  -e MYSQL_ROOT_PASSWORD=hyc12345 \
  -p 3306:3306 \
  -d mysql:latest \

# test mysql database connection via below cli
# mysql --host=127.0.0.1 --port=13306 -u root -p
  