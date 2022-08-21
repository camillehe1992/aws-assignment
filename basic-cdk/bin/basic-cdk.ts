#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { VpcCdkStack } from '../lib/vpc-cdk-stack';
import { IamCdkStack } from '../lib/iam-cdk-stack';
import { RdsCdkStack } from '../lib/rds-cdk-stack';
import { EcsClusterCdkStack } from '../lib/ecs-cluster-cdk-stack';
import { EcsServiceAlbCdkStack } from '../lib/ecs-service-alb-cdk-stack';

import conf from '../config/app.conf';
import { HostedZoneCdkStack } from '../lib/hostzone-cdk-stack';

const env = { 
  account: conf.account,
  region: conf.region
}

const app = new cdk.App();

const vpcCdkStack = new VpcCdkStack(app, 'VpcCdkStack', { env });
const iamCdkStack = new IamCdkStack(app, 'IamCdkStack', { env });

const rdsCdkStack = new RdsCdkStack(app, 'RdsCdkStack', { 
  vpc: vpcCdkStack.vpc,
  backendSG: vpcCdkStack.backendServerSG,
  dbSG: vpcCdkStack.dbserverSG,
  env
});

const ecsClusterCdkStack = new EcsClusterCdkStack(app, 'EcsClusterCdkStack', { 
  vpc: vpcCdkStack.vpc,
  securityGroup: vpcCdkStack.backendServerSG,
  env
});

const ecsServiceAlbCdkStack = new EcsServiceAlbCdkStack(app, 'EcsServiceAlbCdkStack', {
  vpc: vpcCdkStack.vpc,
  securityGroup: vpcCdkStack.webserverSG,
  ecsCluster: ecsClusterCdkStack.ecsCluster,
  secret: rdsCdkStack.dbCluster.secret,
  env
});

new HostedZoneCdkStack(app, 'HostedZoneCdkStack', {
  vpc: vpcCdkStack.vpc,
  alb: ecsServiceAlbCdkStack.alb,
  env
});


