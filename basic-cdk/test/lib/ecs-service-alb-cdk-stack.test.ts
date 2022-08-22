import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as ssm from 'aws-cdk-lib/aws-secretsmanager';
import * as Stack from '../../lib/ecs-service-alb-cdk-stack';
import { EcsClusterCdkStack } from '../../lib/ecs-cluster-cdk-stack';

import conf from '../../config/app.conf';

let app: cdk.App;
let stack: cdk.Stack;
let template: cdk.assertions.Template;

describe('EcsServiceAlbCdkStack', () => {
  let vpc;
  let securityGroup;
  let ecsCluster;
  let secret: ssm.ISecret;

  beforeAll(() => {
    app = new cdk.App();
    // create reference stacks and resources
    const vpcStack = new cdk.Stack(app, 'VpcCdkStack');
    vpc = new ec2.Vpc(vpcStack, 'VPC', {});
    securityGroup = new ec2.SecurityGroup(vpcStack, 'SecurityGroup', { vpc });
    const ecsClusterStack = new EcsClusterCdkStack(app, 'EcsClusterCdkStack', {
      vpc,
      securityGroup
    });
    ecsCluster = ecsClusterStack.ecsCluster;
    stack = new Stack.EcsServiceAlbCdkStack(app, 'EcsServiceAlbCdkStack', {
      vpc,
      securityGroup,
      ecsCluster,
      secret
    });
    template = Template.fromStack(stack);
  });
  
  test('should create a task definition', () => {
    template.hasResourceProperties('AWS::ECS::TaskDefinition',  Match.objectLike({
      ContainerDefinitions: [{
        Cpu: parseInt(conf.taskCpu),
        Memory: parseInt(conf.taskMemoryMiB),
        Image: conf.image
      }],
      RequiresCompatibilities: ['EC2']
    }));
  });
  
  test('should create an target group', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', Match.objectLike({
      Name: `${conf.appName}-${conf.environment}-default`
    }));
  });
  
  test('should create an application load balancer', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', Match.objectLike({
      Name: `${conf.appName}-${conf.environment}`,
      Scheme: 'internal'
    }));
  });
  
  test('should create a application listener', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', Match.objectLike({
      Port: 80,
      Protocol: 'HTTP'
    }));
  });

  test('should create an ECS service', () => {
    template.hasResourceProperties('AWS::ECS::Service', Match.objectLike({
      DesiredCount: 1,
      LaunchType: 'EC2',
      ServiceName: `${conf.appName}-${conf.environment}`
    }));
  });

});
