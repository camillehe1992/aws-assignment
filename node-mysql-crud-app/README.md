# A webapp that interact with MySQL database

## Build & Push docker image into docker hub

```
# build docker image
docker build . -t camillehe1992/webapp:latest

docker login

docker push camillehe1992/webapp:latest
```

## Run container on local for testing purpose

```
cd
docker run -it camillehe1992/webapp \
  -v /.aws:/usr/src/app/.aws \
  -e AWS_SECRET_ID='REPLACE_ME' \
  bash
```
