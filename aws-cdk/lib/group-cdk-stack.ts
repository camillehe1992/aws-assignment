import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

import conf from '../config/app.conf';

// import { VpcCdkStack } from './vpc-cdk-stack';
// import { EcsClusterCdkStack } from './ecs-cluster-cdk-stack';
// import { SharedCdkStack } from './shared-cdk-stack';

export class GroupCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Dependency stacks
    // const vpcCdkStack = new VpcCdkStack(scope, 'VpcCdkStack') 
    // this.addDependency(vpcCdkStack);
    // const ecsClusterCdkStack = new EcsClusterCdkStack(scope, 'EcsClusterCdkStack') 
    // this.addDependency(ecsClusterCdkStack);
    // const sharedCdkStack = new SharedCdkStack(scope, 'SharedCdkStack') 
    // this.addDependency(sharedCdkStack);

    // import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'MainVpc',
    });

    // import backend security group by name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'backend-server-sg', vpc);
    
    // import ECS cluster by attributes
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
          protocol: ecs.Protocol.TCP
        }
      ],
      // environment: {
      //   ['AWS_SECRET_ID']: cdk.Fn.importValue('dbSecretName')
      // }
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
      targetGroupName: `${conf.appName}-${conf.environment}-default`,
      targetType: elbv2.TargetType.INSTANCE,
      vpc
    });

    const alb = elbv2.ApplicationLoadBalancer.fromLookup(this, 'ALB', {
      loadBalancerArn: ssm.StringParameter.valueFromLookup(this, '/SharedCdkStack/albArn')
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
  }
}