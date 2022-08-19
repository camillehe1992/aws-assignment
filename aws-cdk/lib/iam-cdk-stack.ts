import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

import conf from '../config/app.conf';

export class IamCdkStack extends cdk.Stack {

  public readonly ec2InstanceRole: iam.Role;
  public readonly ecsTaskExecutionRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { ec2InstanceRoleName, ecsTaskExecutionRoleName } = conf;

    // create an IAM role to associate with the instance profile that is used by ECS container instances    
    this.ec2InstanceRole = new iam.Role(this, 'EC2InstanceRole', {
      description: 'The role is assumed by EC2 instances running in ECS Cluster',
      roleName: ec2InstanceRoleName,
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
    this.ecsTaskExecutionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      description: 'The role is used for task that running in ECS container instances',
      roleName: ecsTaskExecutionRoleName,
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
        ['allow-secret-manager-readonly-policy']: new iam.PolicyDocument({
          statements: [ new iam.PolicyStatement({
            actions: [
              'secretsmanager:GetSecretValue'
            ],
            resources: ['*'],
            effect: iam.Effect.ALLOW
          })]
        })
      }
    });
  }
}