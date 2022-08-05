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
    
    // 👇 create the rds cluster
    const cluster = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_01_0 }),
      credentials: rds.Credentials.fromGeneratedSecret('clusteradmin'), // Optional - will default to 'admin' username and generated password
      defaultDatabaseName: 'mysql-database',
      instanceProps: {
        // optional , defaults to t3.medium
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        vpc,
        securityGroups: [securityGroup]
      },
    });
  }
}
