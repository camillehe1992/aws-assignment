#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkStack } from '../lib/aws-cdk-stack';
import { HostedZoneCdkStack } from '../lib/hostzone-cdk-stack';
import { RdsCdkStack } from '../lib/rds-cdk-stack';
import { EcsClusterCdkStack } from '../lib/ecs-cluster-cdk-stack';
import { SharedCdkStack } from '../lib/shared-cdk-stack';

import conf from '../config/app.conf';

const env = { 
  account: conf.account,
  region: conf.region
}

const app = new cdk.App();

new AwsCdkStack(app, 'AwsCdkStack', { env });
new HostedZoneCdkStack(app, 'HostedZoneCdkStack', { env });
new RdsCdkStack(app, 'RdsCdkStack', { env });
new EcsClusterCdkStack(app, 'EcsClusterCdkStack', { env });
new SharedCdkStack(app, 'SharedCdkStack', { env });