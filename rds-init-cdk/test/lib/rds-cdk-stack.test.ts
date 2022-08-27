import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template } from 'aws-cdk-lib/assertions';
import * as Stack from '../../lib/rds-cdk-stack';

let app: cdk.App;
let stack: cdk.Stack;
let template: cdk.assertions.Template;

describe('RdsCdkStack', () => {
  let vpc;
  let securityGroup;

  beforeAll(() => {
    app = new cdk.App();
    // create reference stacks and resources
    const vpcStack = new cdk.Stack(app, 'VpcCdkStack');
    vpc = new ec2.Vpc(vpcStack, 'VPC', {});
    securityGroup = new ec2.SecurityGroup(vpcStack, 'SecurityGroup', { vpc });

    stack = new Stack.RdsCdkStack(app, 'RdsCdkStack', {
      vpc,
      backendSG: securityGroup,
      dbSG: securityGroup,
    });
    template = Template.fromStack(stack);
  });

  test('should create a RDS database instace with engine ', () => {
    template.hasResourceProperties('AWS::RDS::DBInstance', {
      Engine: 'mysql'
    });
  });

  test('should create a secret for Database', () => {
    template.hasResource('AWS::SecretsManager::Secret', {});
  });

  test('should create one instance in Database', () => {
    template.resourceCountIs('AWS::RDS::DBInstance', 1);
  });

  test('should create a Database subnet group', () => {
    template.hasResource('AWS::RDS::DBSubnetGroup', {});
  });

  test('should create three lambda functions for database initialization', () => {
    template.resourceCountIs('AWS::Lambda::Function', 3);
  });
});
