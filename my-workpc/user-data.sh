#! /bin/bash

# https://dev.to/usmanalimaan/how-to-install-and-run-docker-on-aws-ec2-bim

sudo su

# Setting up repository
apt-get update && apt-get install \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  npm

# Add Docker’s official GPG key:
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


# According to official doc updating the package manager and installing docker engine
apt-get install docker-ce docker-ce-cli containerd.io

# https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04
# install env for mysql
apt-get install mysql-server

systemctl start mysql.service


mkdir code 
cd code
git clone https://github.com/camillehe1992/aws-assignment.git

mysql -u root -p --database=socka < ./aws-assignment/node-mysql-crud-app/create-db.sql

docker -v

