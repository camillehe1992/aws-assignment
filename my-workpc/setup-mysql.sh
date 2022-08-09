#! /bin/bash

# https://hevodata.com/learn/docker-mysql/

# pull the docker image for mysql
docker pull mysql/mysql-server:latest

# setup local files for mysql container configuration
mkdir docker
mkdir docker/mysql
mkdir docker/mysql/conf.d
mkdir docker/mysql/data

# deploy and start mysql container
docker run \
  -d mysql/mysql-server:latest \
  -p 3306:3306 \
  -v /home/ubuntu/docker/mysql/conf.d:/etc/mysql/conf.d \
  -v /home/ubuntu/docker/mysql/data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=123 \
  --name docker_mysql

# test mysql database connection via below cli
# mysql --host=127.0.0.1 --port=13306 -u root -p
