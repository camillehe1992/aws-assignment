import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';

import conf from '../config/app.conf';

interface EcsClusterCdkStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
}

export class EcsClusterCdkStack extends cdk.Stack {

  public readonly ecsCluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: EcsClusterCdkStackProps) {
    super(scope, id, props);

    const { vpc, securityGroup } = props;
    const { ec2InstanceRoleName, ecsClusterName, ec2InstanceType, keyPairName } = conf;
    
    // import ECS container instance IAM role (workaround dependency cyclic reference issue)
    const instanceRole = iam.Role.fromRoleName(
      this,
      'Ec2InstanceRole',
      ec2InstanceRoleName
    );

    const keyPair = new ec2.CfnKeyPair(this, 'CfnKeyPair', {
      keyName: keyPairName,
      tags: [{
        key: 'StackName',
        value: this.stackName,
      }],
    });

    // create a EC2 launch template
    const launchTemplate = new ec2.LaunchTemplate(this, 'ASG-LaunchTemplate', {
      instanceType: new ec2.InstanceType(ec2InstanceType),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      userData:  ec2.UserData.forLinux(),
      securityGroup: securityGroup,
      role: instanceRole,
      keyName: keyPair.keyName,
      launchTemplateName: this.stackName + '-launch-template'
    });
  
    // create auto scaling group for ECS cluster
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      launchTemplate: launchTemplate,
      updatePolicy: autoscaling.UpdatePolicy.rollingUpdate()
    }); 

    // create an ECS cluster
    this.ecsCluster = new ecs.Cluster(this, 'ECSCluster', {
      vpc,
      clusterName: ecsClusterName,
    });

    // create a capacity provider and associate it with ECS cluster
    const capacityProvider = new ecs.AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup,
      enableManagedScaling: true,
      capacityProviderName: 'AsgCapacityProvider',
      enableManagedTerminationProtection: false
    });
    
    this.ecsCluster.addAsgCapacityProvider(capacityProvider);
  }
}