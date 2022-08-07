import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import conf from '../config/app.conf';

export class GroupCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Mappings
    const deploymentMapping = new cdk.CfnMapping(this, 'deploymentMapping', {
      mapping: {
        'g1': {
          RulePriority: 30,
        },
        'g2': {
          RulePriority: 40,
        }
      },
      lazy: true
    });

    const validationMapping = new cdk.CfnMapping(this, 'validationMapping', {
      mapping: {
        'g1': {
          RulePriority: 20,
        },
        'g2': {
          RulePriority: 10,
        }
      },
      lazy: true
    });

    // 👇 import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'main-vpc',
    });

    // 👇 import Database Security Group by Name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'backend-server-sg', vpc);
    
    const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      vpc,
      securityGroups: [securityGroup],
      clusterName: conf.ecsClusterName ?? ''
    });

    // Resources
    const taskDefinition = new ecs.TaskDefinition(this, 'TaskDefinition', {
      compatibility: ecs.Compatibility.EC2,
      cpu: conf.taskCpu,
      memoryMiB: conf.taskMemoryMiB,
      family: `${conf.appName}-${conf.environment}-${conf.groupId}`,
      networkMode: ecs.NetworkMode.BRIDGE
    });

    const containerDefinition = new ecs.ContainerDefinition(this, 'ContainerDefinition', {
      image: ecs.ContainerImage.fromRegistry('/aws/aws-example-app'),
      taskDefinition,
      cpu: parseInt(conf.taskCpu ?? '0'),
      memoryLimitMiB: parseInt(conf.taskMemoryMiB ?? '0'),
      portMappings: [
        {
          containerPort: 0,
          protocol: ecs.Protocol.TCP
        }
      ]
    });

    containerDefinition.addVolumesFrom({
      readOnly: false,
      sourceContainer: 'container-volume'
    });

    const targetGroup = new elbv2.ApplicationTargetGroup (this, 'ApplicationTargetGroup', {
      deregistrationDelay: cdk.Duration.minutes(5),
      healthCheck: {
        enabled: true,
        healthyHttpCodes: '200',
        healthyThresholdCount: 10,
        interval: cdk.Duration.seconds(5),
        path: '/health',
        port: 'traffic-port',
        protocol: elbv2.Protocol.HTTP,
        timeout: cdk.Duration.seconds(3),
        unhealthyThresholdCount: 3,
      },
      protocol: elbv2.ApplicationProtocol.HTTPS,
      targetGroupName: `${conf.appName}-${conf.environment}-${conf.groupId}`,
      targetType: elbv2.TargetType.INSTANCE,
      vpc: vpc,
    })

    const ecsService = new ecs.Ec2Service(this, 'Ec2Service', {
      cluster,
      taskDefinition,
      deploymentController:  {
        type: ecs.DeploymentControllerType.ECS,
      },
      desiredCount: parseInt(conf.containerCount ?? '1'),
      serviceName: `${conf.appName}-${conf.environment}-${conf.groupId}`
    });

    ecsService.attachToApplicationTargetGroup(targetGroup);

    const listenerRule = new elbv2.ApplicationListenerRule(this, 'ListenerRule', {
      listener: elbv2.ApplicationListener.fromLookup(this, 'ApplicationListener', {
        listenerArn: `${conf.appName}-${conf.environment}-active-listener`
      }),
      priority: parseInt(deploymentMapping.findInMap(conf.groupId ?? '0', 'RulePriority')),
      action: elbv2.ListenerAction.forward([targetGroup]),
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['*']),
      ]
    });

    const passiveListenerRule = new elbv2.ApplicationListenerRule(this, 'PassiveListenerRule', {
      listener: elbv2.ApplicationListener.fromLookup(this, 'PassiveApplicationListener', {
        listenerArn: `${conf.appName}-${conf.environment}-active-listener`
      }),
      priority: parseInt(validationMapping.findInMap(conf.groupId ?? '0', 'RulePriority')),
      action: elbv2.ListenerAction.forward([targetGroup]),
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['*']),
        elbv2.ListenerCondition.httpHeader('X-Forword-To-Passive', ['true'])
      ]
    });
  }
}