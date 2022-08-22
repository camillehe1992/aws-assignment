import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Stack from '../../lib/vpc-cdk-stack';

let app: cdk.App;
let stack: cdk.Stack;
let template: cdk.assertions.Template;

describe('VpcCdkStack', () => {
  beforeAll(() => {
    app = new cdk.App();
    stack = new Stack.VpcCdkStack(app, 'VpcCdkStack');
    template = Template.fromStack(stack);
  });
  
  test('should create a VPC with CidrBlock 10.0.0.0/16', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16'
    });
  });
  
  test('should create a NAT Gateway', () => {
    template.hasResource('AWS::EC2::NatGateway', {});
  });
  
  test('should create a Internet Gateway', () => {
    template.hasResource('AWS::EC2::InternetGateway', {});
  });
  
  test('should create 4 Subnets', () => {
    template.resourceCountIs('AWS::EC2::Subnet', 4);
    ['10.0.0.0/24', '10.0.1.0/24', '10.0.2.0/28', '10.0.2.16/28'].forEach(cidrBlock => {
      template.hasResourceProperties('AWS::EC2::Subnet', Match.objectLike({
        CidrBlock: cidrBlock
      }));
    });
  });
  
  test('should create 3 Security Groups', () => {
    template.resourceCountIs('AWS::EC2::SecurityGroup', 3);
  
    template.resourceCountIs('AWS::EC2::Subnet', 4);
    ['web-server-sg', 'backend-server-sg', 'database-server-sg'].forEach(name => {
      template.hasResourceProperties('AWS::EC2::SecurityGroup', Match.objectLike({
        GroupName: name
      }));
    });
  });
});