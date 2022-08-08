#! /bin/bash

# https://dev.to/usmanalimaan/how-to-install-and-run-docker-on-aws-ec2-bim

# Setting up repository
sudo apt-get update

 sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker’s official GPG key:
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


# According to official doc updating the package manager and installing docker engine
sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io

docker -v

