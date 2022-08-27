#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { VpcCdkStack } from '../lib/vpc-cdk-stack';
import { RdsCdkStack } from '../lib/rds-cdk-stack';

import conf from '../config/app.conf';

const env = { 
  account: conf.account,
  region: conf.region
}

const app = new cdk.App();

cdk.Tags.of(app).add('StackType', 'rds-init-cdk');

const vpcCdkStack = new VpcCdkStack(app, 'VpcCdkStack', { env });

const rdsCdkStack = new RdsCdkStack(app, 'RdsCdkStack', { 
  vpc: vpcCdkStack.vpc,
  backendSG: vpcCdkStack.backendServerSG,
  dbSG: vpcCdkStack.dbserverSG,
  env
});