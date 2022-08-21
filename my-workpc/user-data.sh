#! /bin/bash

# Step 1. Setup docker env on remote (skip step 1 if your local machine has docker installed)
# Update the installed packages and package cache on your instance.
sudo yum update -y
 
# Install the most recent Docker Community Edition package.
sudo yum install docker
 
# Add the ec2-user to the docker group so you can execute Docker commands without using sudo.
# Exit the terminal and re-login to make the change effective
sudo usermod -a -G docker ec2-user
 
# Start docker service
sudo systemctl start docker
 
# Check the Docker service.
sudo systemctl status docker
 
# Check docker version
sudo docker version

# Step 2. Run a mysql container
# Run a mysql container as background and expose port 3307 so that it can be access
# via port 3307 and host which is the public IP of remote.
docker run \
  --detach \
  --name=test-mysql \
  --env="MYSQL_ROOT_PASSWORD=password" \
  --publish 6603:3306 \
  mysql

# Enter the container to init database
docker exec -it test-mysql mysql -p

# Enter password:
# Welcome to the MySQL monitor.  Commands end with ; or \g.
# Your MySQL connection id is 8
# Server version: 8.0.30 MySQL Community Server - GPL

# Copyright (c) 2000, 2022, Oracle and/or its affiliates.

# Oracle is a registered trademark of Oracle Corporation and/or its
# affiliates. Other names may be trademarks of their respective
# owners.

# Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

# mysql>

# Run below script to create database and table

# grant  `root`@`xxx.xxx.xxx.xxx` remote access
# xxx.xxx.xxx.xxx is your local machine ip address for remote server or localhost for local server
CREATE USER `root`@`175.171.183.164`;
GRANT ALL ON *.* to `root`@`175.171.183.164` WITH GRANT OPTION;

CREATE DATABASE IF NOT EXISTS pokemon;
USE pokemon;
CREATE TABLE IF NOT EXISTS `players` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `number` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `user_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;