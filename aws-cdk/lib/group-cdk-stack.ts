import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

import conf from '../config/app.conf';

export class GroupCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // // Conditions
    // const IsActive = new cdk.CfnCondition(
    //   this,
    //   'IsActive',
    //   {
    //     expression: cdk.Fn.conditionEquals(this, 'true')
    //   }
    // );
    
    // const IsNotActive = new cdk.CfnCondition(
    //   this,
    //   'IsNotActive',
    //   {
    //     expression: cdk.Fn.conditionNot(cdk.Fn.conditionEquals(IsActive, 'true'))
    //   }
    // );

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

    // const validationMapping = new cdk.CfnMapping(this, 'validationMapping', {
    //   mapping: {
    //     'g1': {
    //       RulePriority: 20,
    //     },
    //     'g2': {
    //       RulePriority: 10,
    //     }
    //   },
    //   lazy: true
    // });

    // 👇 import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'main-vpc',
    });

    // 👇 import Database Security Group by Name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'backend-server-sg', vpc);
    
    const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      vpc,
      securityGroups: [securityGroup],
      clusterName: cdk.Fn.importValue('ECSClusterName')
    });

    // Resources
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition');
    
    taskDefinition.addContainer('TheContainer', {
      image: ecs.ContainerImage.fromRegistry('nginx'),
      memoryLimitMiB: parseInt(conf.taskMemoryMiB ?? '0'),
      portMappings: [
        {
          containerPort: 80,
          hostPort: 0,
          protocol: ecs.Protocol.TCP
        }
      ],
      // environment: {
      //   ['AWS_SECRET_ID']: cdk.Fn.importValue('dbSecretName')
      // }
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
      serviceName: `${conf.appName}-${conf.environment}-${conf.groupId}`,
    });

    ecsService.attachToApplicationTargetGroup(targetGroup);

    const listener = elbv2.ApplicationListener.fromLookup(
      this,
      'Listener',
      {
        loadBalancerArn: ssm.StringParameter.valueFromLookup(this, '/SharedCdkStack/albArn'),
        listenerPort: 443,
        listenerProtocol: elbv2.ApplicationProtocol.HTTPS
      }
    )
    const listenerRule = new elbv2.ApplicationListenerRule(
      this,
      'ListenerRule',
      {
        listener,
        priority: 30,
        action: elbv2.ListenerAction.forward([targetGroup]),
        conditions: [
          elbv2.ListenerCondition.pathPatterns(['*']),
        ]
      }
    );

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