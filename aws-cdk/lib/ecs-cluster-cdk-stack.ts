import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';

import conf from '../config/app.conf';

// import { VpcCdkStack } from './vpc-cdk-stack';

export class EcsClusterCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dependency stacks
    // const vpcCdkStack = new VpcCdkStack(scope, 'VpcCdkStack') 
    // this.addDependency(vpcCdkStack);
    
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

    // import VPC by name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'MainVpc',
    });

    // import backend security group by name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'backend-server-sg', vpc);
    
    // import ECS container instance IAM role
    const role = iam.Role.fromRoleName(
      this,
      'Ec2InstanceRole',
      cdk.Fn.importValue('Ec2InstanceRoleName')
    );

    const userData = ec2.UserData.forLinux();

    // create a EC2 launch template
    const launchTemplate = new ec2.LaunchTemplate(this, 'ASG-LaunchTemplate', {
      instanceType: new ec2.InstanceType(instanceType.valueAsString),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      userData,
      securityGroup: securityGroup,
      role,
      keyName: 'ec2-private-key',
      launchTemplateName: this.stackName + '-launch-template'
    });
  
    // create auto scaling group for ECS cluster
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      launchTemplate: launchTemplate,
      updatePolicy: autoscaling.UpdatePolicy.rollingUpdate()
    }); 

    // create an ECS cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: clusterName.valueAsString,
    });

    // create a capacity provider and associate it with ECS cluster
    const capacityProvider = new ecs.AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup,
      enableManagedScaling: true,
      capacityProviderName: 'AsgCapacityProvider'
    });
    
    cluster.addAsgCapacityProvider(capacityProvider);

    // Outputs
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      exportName: 'ECSClusterName'
    });
  }
}