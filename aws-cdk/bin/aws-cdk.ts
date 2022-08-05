#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkStack } from '../lib/aws-cdk-stack';
import { RdsCdkStack } from '../lib/rds-cdk-stack';

const env = { account: '824709318323', region: 'ap-south-1' };

const app = new cdk.App();

new AwsCdkStack(app, 'AwsCdkStack', { env });
new RdsCdkStack(app, 'RdsCdkStack', { env });