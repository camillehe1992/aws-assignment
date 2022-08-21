import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-secretsmanager';

import conf from '../config/app.conf';

interface EcsServiceAlbCdkStackProps extends cdk.StackProps {
  albIsInternetFacing: boolean;
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  ecsCluster: ecs.Cluster;
  secret?: ssm.ISecret
}

export class EcsServiceAlbCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsServiceAlbCdkStackProps) {
    super(scope, id, props);

    const { albIsInternetFacing, vpc, securityGroup, ecsCluster, secret} = props;
    const { appName, environment, ecsTaskExecutionRoleName, ecsTaskRoleName, image, taskMemoryMiB, taskCpu } = conf;

    // import ECS task execution role (workaround dependency cyclic reference issue)
    const executionRole = iam.Role.fromRoleName(
      this,
      'EcsTaskExecutionRole',
      ecsTaskExecutionRoleName
    );

    // import ECS task role (workaround dependency cyclic reference issue)
    const taskRole = iam.Role.fromRoleName(
      this,
      'EcsTaskRole',
      ecsTaskRoleName
    );

    // Resources
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'Ec2TaskDefinition', {
      executionRole,
      taskRole
    });
    
    taskDefinition.addContainer('TheContainer', {
      image: ecs.ContainerImage.fromRegistry(image),
      memoryLimitMiB: parseInt(taskMemoryMiB),
      cpu: parseInt(taskCpu),
      portMappings: [
        {
          containerPort: 5000,
          protocol: ecs.Protocol.TCP
        }
      ],
      logging: ecs.LogDriver.awsLogs({ streamPrefix: `${appName}`, logRetention: 7 }),
      environment: {
        ['AWS_SECRET_ID']: secret?.secretArn ?? ''
      }
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ApplicationTargetGroup', {
      healthCheck: {
        path: '/health'
      },
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
      targetGroupName: `${appName}-${environment}-default`,
      targetType: elbv2.TargetType.INSTANCE,
      vpc
    });

    // create an alb
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc,
      idleTimeout: cdk.Duration.seconds(60),
      ipAddressType: elbv2.IpAddressType.IPV4,
      internetFacing: albIsInternetFacing,
      loadBalancerName: `${conf.appName}-${conf.environment}`,
      securityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    const albListener = new elbv2.ApplicationListener(this, 'ApplicationListener', {
      loadBalancer: alb,
      port: 80,
      defaultAction: elbv2.ListenerAction.forward([targetGroup])
    });

    const ecsService = new ecs.Ec2Service(this, 'Ec2Service', {
      cluster: ecsCluster,
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
  }
}
