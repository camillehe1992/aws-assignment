import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';

import conf from '../config/app.conf';

// import { VpcCdkStack } from './vpc-cdk-stack';

export class EcsServiceAlbCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dependency stacks
    // const vpcCdkStack = new VpcCdkStack(scope, 'VpcCdkStack') 
    // this.addDependency(vpcCdkStack);

    // import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'MainVpc',
    });

    // import database security group by name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'web-server-sg', vpc);

     // import ECS cluster by attributes
     const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      vpc,
      securityGroups: [securityGroup],
      clusterName: cdk.Fn.importValue('ECSClusterName')
    });

    // import ECS task execution role
    const executionRole = iam.Role.fromRoleName(
      this,
      'EcsTaskExecutionRole',
      cdk.Fn.importValue('EcsTaskExecutionRoleName')
    );

    // Resources
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', {
      executionRole
    });
    
    taskDefinition.addContainer('TheContainer', {
      image: ecs.ContainerImage.fromRegistry(conf.image ?? ''),
      memoryLimitMiB: parseInt(conf.taskMemoryMiB ?? '0'),
      cpu: parseInt(conf.taskCpu ?? '0'),
      portMappings: [
        {
          containerPort: 5000,
          protocol: ecs.Protocol.TCP
        }
      ],
      logging: ecs.LogDriver.awsLogs({ streamPrefix: `${conf.appName}`, logRetention: 7 })
      // environment: {
      //   ['AWS_SECRET_ID']: cdk.Fn.importValue('dbSecretName')
      // }
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      healthCheck: {
        path: '/health'
      },
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
      targetGroupName: `${conf.appName}-${conf.environment}-default`,
      targetType: elbv2.TargetType.INSTANCE,
      vpc
    });

    // create an alb
    const alb = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc,
      idleTimeout: cdk.Duration.seconds(60),
      ipAddressType: elbv2.IpAddressType.IPV4,
      loadBalancerName: `${conf.appName}-${conf.environment}`,
      securityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    const albListener = new elbv2.ApplicationListener(this, 'AlbListener', {
      loadBalancer: alb,
      port: 80,
      defaultAction: elbv2.ListenerAction.forward([targetGroup])
    });

    const ecsService = new ecs.Ec2Service(this, 'Ec2Service', {
      cluster,
      taskDefinition,
      deploymentController:  {
        type: ecs.DeploymentControllerType.ECS,
      },
      desiredCount: parseInt(conf.containerCount ?? '1'),
      serviceName: `${conf.appName}-${conf.environment}-${conf.groupId}`,
    });

    ecsService.attachToApplicationTargetGroup(targetGroup);

    // setup autoscaling policy
    const scaleTarget = ecsService.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2
    });
    scaleTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 60,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });
    // Outputs
    new cdk.CfnOutput(this, 'AlbDNSName', {
      value: alb.loadBalancerDnsName,
      exportName: 'AlbDNSName'
    });
  }
}
