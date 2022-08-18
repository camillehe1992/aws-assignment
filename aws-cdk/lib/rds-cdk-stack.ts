import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface RdsCdkStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
}

export class RdsCdkStack extends cdk.Stack {
  
  public readonly dbCluster: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, props: RdsCdkStackProps) {
    super(scope, id, props);

    const { vpc, securityGroup } = props;
    
    // create the rds cluster with 2 instances (1 reader and 1 writer)
    this.dbCluster = new rds.DatabaseCluster(this, 'DatabaseCluster', {
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
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        vpc,
        securityGroups: [securityGroup]
      },
    });
  }
}
