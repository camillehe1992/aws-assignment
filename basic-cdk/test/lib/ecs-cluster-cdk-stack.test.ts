import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template } from 'aws-cdk-lib/assertions';
import * as Stack from '../../lib/ecs-cluster-cdk-stack';

import conf from '../../config/app.conf';

let app: cdk.App;
let stack: cdk.Stack;
let template: cdk.assertions.Template;

describe('EcsClusterCdkStack', () => {
  let vpc;
  let securityGroup;
  beforeAll(() => {
    app = new cdk.App();
    // create reference stacks and resources
    const vpcStack = new cdk.Stack(app, 'VpcCdkStack');
    vpc = new ec2.Vpc(vpcStack, 'VPC', {});
    securityGroup = new ec2.SecurityGroup(vpcStack, 'SecurityGroup', { vpc });
    
    stack = new Stack.EcsClusterCdkStack(app, 'EcsClusterCdkStack', {
      vpc,
      securityGroup
    });
    template = Template.fromStack(stack);
  });
  
  test('should create a ECS cluster', () => {
    template.hasResourceProperties('AWS::EC2::KeyPair', {
      KeyName: conf.keyPairName
    });
  });
  
  test('should create a ECS container launch template', () => {
    template.hasResourceProperties('AWS::EC2::LaunchTemplate', {
      LaunchTemplateData: {
        InstanceType: conf.ec2InstanceType,
        KeyName: conf.keyPairName
      }
    });
  });
  
  test('should create an auto scaling group', () => {
    template.hasResourceProperties('AWS::AutoScaling::AutoScalingGroup', {
      LaunchTemplate: {}
    });
  });
  
  test('should create an ECS cluster', () => {
    template.hasResourceProperties('AWS::ECS::Cluster', {
      ClusterName: conf.ecsClusterName
    });
  });
  
  test('should create an ASG capacity provider', () => {
    template.hasResourceProperties('AWS::ECS::CapacityProvider', {
      Name: 'AsgCapacityProvider'
    });
  });
});
