#! /bin/bash

# stacks should be deployed in order
npm run deploy \
  EcsClusterCdkStack \
  HostedZoneCdkStack \
  SharedCdkStack \
  GroupCdkStack