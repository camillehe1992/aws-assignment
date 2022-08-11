import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';

import conf from '../config/app.conf';

export class EcsClusterCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Parameters
    const clusterName = new cdk.CfnParameter(this, "ECSClusterName", {
      type: "String",
      description: 'The name of ECS Cluster',
      default: conf.ecsClusterName
    });

    const instanceType = new cdk.CfnParameter(this, "InstanceType", {
      type: "String",
      description: 'The EC2 instance type',
      default: conf.ec2InstanceType
    });


    // 👇 import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'main-vpc',
    });

    // 👇 import Database Security Group by Name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'backend-server-sg', vpc);
  
    // create an ECS cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: clusterName.valueAsString,
    });

    const role = iam.Role.fromRoleName(this,
      'Ec2InstanceRole',
      cdk.Fn.importValue('Ec2InstanceRoleName')
    );

    // create a EC2 launch template
    const launchTemplate = new ec2.LaunchTemplate(this, 'ASG-LaunchTemplate', {
      instanceType: new ec2.InstanceType(instanceType.valueAsString),
      machineImage: ecs.EcsOptimizedImage.amazonLinux(),
      userData: ec2.UserData.forLinux(),
      securityGroup: securityGroup,
      role,
      keyName: 'ec2-private-key',
      launchTemplateName: this.stackName + '-launch-template',
      blockDevices: [{
        deviceName: '/dev/xvda',
        volume: ec2.BlockDeviceVolume.ebs(30, {
          encrypted: true,
          volumeType: ec2.EbsDeviceVolumeType.STANDARD
        }),
        mappingEnabled: true
      }],
    });

    // create auto scaling group for ECS cluster
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      launchTemplate: launchTemplate,
      updatePolicy: autoscaling.UpdatePolicy.rollingUpdate()
    });

    // create a capacity provider and associate it with ECS cluster
    const capacityProvider = new ecs.AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup,
      capacityProviderName: 'AsgCapacityProvider',
      machineImageType: ecs.MachineImageType.AMAZON_LINUX_2,
    });
    
    cluster.addAsgCapacityProvider(capacityProvider);

    // define ECS cluster scale policies and metrics
    // const metric = new cloudwatch.Metric({
    //   metricName: 'ECSInstances',
    //   namespace: 'AWS/ECS',
    //   period: cdk.Duration.minutes(3),
    //   statistic: 'Average'
    // });

    // const asgScaleUpPolicy = new autoscaling.StepScalingPolicy(this, 'ScaleUpPolicy', {
    //   autoScalingGroup,
    //   metric: metric,
    //   adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
    //   cooldown: cdk.Duration.minutes(15),
    //   scalingSteps: [{
    //     change: 3,
    //     lower: 3,
    //     upper: 5
    //   }]
    // });

    // const asgScaleDownPolicy = new autoscaling.StepScalingPolicy(this, 'ScaleDownPolicy', {
    //   autoScalingGroup,
    //   metric: metric,
    //   adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
    //   cooldown: cdk.Duration.minutes(15),
    //   scalingSteps: [{
    //     change: 3,
    //     lower: 3,
    //     upper: 5
    //   }]
    // });

    // const asgMetricScaleUpAlarm = new cloudwatch.Alarm(this, 'MetricScaleUpAlarm'. {
    //   comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
    //   threshold: 3,
    //   evaluationPeriods: 5,
    //   metric: metric,
    //   alarmName: `${cluster.clusterName}-MetricScaleUpAlarm`,
    //   alarmDescription: 'Scale up ECS cluster if metric threshold is crossed',
    // })

    // Outputs
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      exportName: 'ECSClusterName'
    });

  }
}