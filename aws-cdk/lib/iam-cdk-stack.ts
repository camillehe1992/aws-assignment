import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

import conf from '../config/app.conf';

export class IamCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Parameters
    const roleName = new cdk.CfnParameter(this, "EC2InstanceRoleName", {
      type: "String",
      description: 'The role is assumed by EC2 instances running in ECS Cluster',
      default: conf.ec2InstanceRoleName
    });

    // create an IAM role to associate with the instance profile that is used by ECS container instances    
    const ec2InstanceRole = new iam.Role(this, 'EC2InstanceRole', {
      description: roleName.description,
      roleName: roleName.valueAsString,
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('ec2.amazonaws.com'),
        new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role')
      ],
      inlinePolicies: {
        ['allow-autoscaling-policy']: new iam.PolicyDocument({
          statements: [ new iam.PolicyStatement({
            actions: [
              'autoscaling:DescribeAutoScalingInstances',
              'autoscaling:CompleteLifecycleAction',
              'autoscaling:DescribeLifecycleHooks'
            ],
            resources: ['*'],
            effect: iam.Effect.ALLOW
          })]
        })
      }
    });

    // create an ECS task definition execution IAM role   
    const ecsTaskExecutionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      description: 'The role is used for task that running in ECS container instances',
      roleName: conf.ecsTaskExecutionRoleName,
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
      ),
      inlinePolicies: {
        ['allow-cloudwatch-policy']: new iam.PolicyDocument({
          statements: [ new iam.PolicyStatement({
            actions: [
              'logs:CreateLogStream',
              'logs:PutLogEvents'
            ],
            resources: ['*'],
            effect: iam.Effect.ALLOW
          })]
        }),
        ['allow-ssm-readonly-policy']: new iam.PolicyDocument({
          statements: [ new iam.PolicyStatement({
            actions: [
              'ssm:Describe*',
              'ssm:Get*',
              'ssm:List'
            ],
            resources: ['*'],
            effect: iam.Effect.ALLOW
          })]
        })
      }
    });
    
    // Outputs
    new cdk.CfnOutput(this, 'Ec2InstanceRoleName', {
      value: ec2InstanceRole.roleName,
      exportName: 'Ec2InstanceRoleName'
    });

    new cdk.CfnOutput(this, 'Ec2InstanceRoleArn', {
      value: ec2InstanceRole.roleArn,
      exportName: 'Ec2InstanceRoleArn'
    });

    new cdk.CfnOutput(this, 'EcsTaskExecutionRoleName', {
      value: ecsTaskExecutionRole.roleName,
      exportName: 'EcsTaskExecutionRoleName'
    });

    new cdk.CfnOutput(this, 'EcsTaskExecutionRoleArn', {
      value: ecsTaskExecutionRole.roleArn,
      exportName: 'EcsTaskExecutionRoleArn'
    });
  }
}