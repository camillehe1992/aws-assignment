#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkStack } from '../lib/aws-cdk-stack';
import { AcmCdkStack } from '../lib/acm-cdk-stack';
import { RdsCdkStack } from '../lib/rds-cdk-stack';
import { EcsClusterCdkStack } from '../lib/ecs-cluster-cdk-stack';
import { SharedCdkStack } from '../lib/shared-cdk-stack';

const env = { account: '824709318323', region: 'ap-south-1' };

const app = new cdk.App();

new AwsCdkStack(app, 'AwsCdkStack', { env });
new AcmCdkStack(app, 'AcmCdkStack', { env });
new RdsCdkStack(app, 'RdsCdkStack', { env });
new EcsClusterCdkStack(app, 'EcsClusterCdkStack', { env });
new SharedCdkStack(app, 'SharedCdkStack', { env });