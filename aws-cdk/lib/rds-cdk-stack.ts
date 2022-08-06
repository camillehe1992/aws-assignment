import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class RdsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'main-vpc',
    });

    // 👇 import Database Security Group by Name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'database-server-sg', vpc)
    
    // 👇 create the rds cluster with 2 instances (1 reader and 1 writer)
    const cluster = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ 
        version: rds.AuroraMysqlEngineVersion.VER_3_02_0
      }),
      // Optional - will default to 'admin' username and generated password
      credentials: rds.Credentials.fromGeneratedSecret('clusteradmin'),
      clusterIdentifier: 'mysql',
      instanceProps: {
        // optional , defaults to t3.medium (wiil incur charge)
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MEDIUM),
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        vpc,
        securityGroups: [securityGroup]
      },
    });

    // 👇 Output
    new cdk.CfnOutput(this, 'dbReaderEndpoint', {
      value: cluster.clusterReadEndpoint.hostname
    });

    new cdk.CfnOutput(this, 'dbWriterEndpoint', {
      value: cluster.clusterEndpoint.hostname
    });

    new cdk.CfnOutput(this, 'secretName', {
      value: cluster.secret?.secretName!
    });

  }
}
