#! /bin/bash

rm -d -r cert
mkdir cert
cd cert

export MSYS_NO_PATHCONV=1

if [ "$#" -ne 1 ]
then
  echo "Error: No domain name argument provided"
  echo "Usage: Provide a domain name as an argument"
  exit 1
fi

DOMAIN=$1

echo "Generating self signed certificate for privided domain: ${DOMAIN}" 

# Generate Private key 

openssl req -x509 \
 -subj "/C=CN/CN=${DOMAIN}" \
 -addext "subjectAltName=DNS:${DOMAIN},DNS:www.${DOMAIN}" \
 -newkey rsa:2048 \
 -nodes \
 -days 365 \
 -out cert.pem \
 -keyout key.pem

 ls -la

 cd -
#  # Import certificate into AWS ACM
 aws acm import-certificate \
  --certificate fileb://cert/cert.pem \
  --private-key fileb://cert/key.pem


  echo "update CERTIFICATE_ARN in .env with new imported CertificateArn, 
  then redeploy stack SharedCdkStack to use this new certificate"
 