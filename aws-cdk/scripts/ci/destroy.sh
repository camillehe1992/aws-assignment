#! /bin/bash

# stacks should be destroy in order
npm run destroy \
  GroupCdkStack \
  SharedCdkStack \
  HostedZoneCdkStack \
  EcsClusterCdkStack 