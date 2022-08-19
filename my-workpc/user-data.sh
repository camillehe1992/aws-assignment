#! /bin/bash

## Update the installed packages and package cache on your instance.
sudo yum update -y
 
## Install the most recent Docker Community Edition package.
sudo yum install docker
 
## Add the ec2-user to the docker group so you can execute Docker commands without using sudo.
## Exit the terminal and re-login to make the change effective
sudo usermod -a -G docker ec2-user
 
## Start docker service
sudo systemctl start docker
 
## Check the Docker service.
sudo systemctl status docker
 
## Check docker version
docker version

## Pull latest version from docker hub
docker pull mysql:latest

# Run a container as background
docker run \
  --detach \
  --name=test-mysql \
  --env="MYSQL_ROOT_PASSWORD=password" \
  --publish 3306:3306 \
  mysql


## Install other packages
sudo yum install git, jq

