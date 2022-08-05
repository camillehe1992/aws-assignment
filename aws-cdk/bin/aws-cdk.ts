#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkStack } from '../lib/aws-cdk-stack';
import { RdsCdkStack } from '../lib/rds-cdk-stack';

const app = new cdk.App();
new AwsCdkStack(app, 'AwsCdkStack', {
  env: { account: '824709318323', region: 'ap-south-1' },
});

// new RdsCdkStack(app, 'RdsCdkStack', {
//   env: { account: '824709318323', region: 'ap-south-1' },
// });