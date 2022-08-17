#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcCdkStack } from '../lib/vpc-cdk-stack';
import { IamCdkStack } from '../lib//iam-cdk-stack';
import { HostedZoneCdkStack } from '../lib/hostzone-cdk-stack';
import { RdsCdkStack } from '../lib/rds-cdk-stack';
import { EcsClusterCdkStack } from '../lib/ecs-cluster-cdk-stack';
import { EcsServiceAlbCdkStack } from '../lib/ecs-service-alb-cdk-stack';

import conf from '../config/app.conf';

const env = { 
  account: conf.account,
  region: conf.region
}

const app = new cdk.App();

new VpcCdkStack(app, 'VpcCdkStack', { env });
new IamCdkStack(app, 'IamCdkStack', { env });
new HostedZoneCdkStack(app, 'HostedZoneCdkStack', { env });
new RdsCdkStack(app, 'RdsCdkStack', { env });
new EcsClusterCdkStack(app, 'EcsClusterCdkStack', { env });
new EcsServiceAlbCdkStack(app, 'EcsServiceAlbCdkStack', { env });