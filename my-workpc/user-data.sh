#! /bin/bash

## Update the installed packages and package cache on your instance.
sudo yum update -y
 
## Install the most recent Docker Community Edition package.
sudo yum install docker git
 
 
## Add the ec2-user to the docker group so you can execute Docker commands without using sudo.
## Exit the terminal and re-login to make the change effective
sudo usermod -a -G docker ec2-user
exit
 
## Enable docker service
sudo systemctl enable docker
 
## Start docker service
sudo systemctl start docker
 
## Check the Docker service.
sudo systemctl status docker
 
## Check docker version
docker version

# Install MYSQL
docker pull mysql/mysql-server:latest

# Create a container
docker run \
  --name=mysql1 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -d mysql/mysql-server:latest

# Connect to DB
#docker exec -it mysql1 mysql -uroot -p


mkdir code 
cd code
git clone https://github.com/camillehe1992/aws-assignment.git

docker exec -it mysql1 mysql -uroot -p --database=socka < ./aws-assignment/node-mysql-crud-app/create-db.sql

docker -v

