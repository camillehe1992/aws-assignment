#! /bin/bash

# https://dev.to/yongchanghe/want-to-install-mysql-database-and-finalize-your-data-using-docker-on-your-aws-ec2-3lc6

docker pull mysql:latest

mkdir docker
mkdir docker/mysql
mkdir docker/mysql/conf
mkdir docker/mysql/data

docker run -d mysql:latest \
  -p 3306:3306 \
  -v /home/ubuntu/docker/mysql/conf/:/etc/mysql/conf.d \
  -v /home/ubuntu/docker/mysql/data/:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=123 \
  --name docker_mysql