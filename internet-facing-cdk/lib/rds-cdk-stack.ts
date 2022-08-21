import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CdkResourceInitializer } from '../lib/resource-initializer';
import * as cwlogs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';


interface RdsCdkStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  backendSG: ec2.SecurityGroup,
  dbSG: ec2.SecurityGroup;
}

export class RdsCdkStack extends cdk.Stack {
  
  public readonly dbCluster: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, props: RdsCdkStackProps) {
    super(scope, id, props);

    const { vpc, backendSG, dbSG } = props;

    const credentials = rds.Credentials.fromGeneratedSecret('clusteradmin');
    
    // create the rds cluster with 2 instances (1 reader and 1 writer)
    this.dbCluster = new rds.DatabaseCluster(this, 'DatabaseCluster', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ 
        version: rds.AuroraMysqlEngineVersion.VER_3_02_0
      }),
      // Optional - will default to 'admin' username and generated password
      credentials,
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
        securityGroups: [dbSG]
      },
    });

    const initializer = new CdkResourceInitializer(this, 'MyRdsInit', {
      config: {
        credsSecretName: credentials.secretName
      },
      fnLogRetention: cwlogs.RetentionDays.TWO_WEEKS,
      fnCode: lambda.Code.fromAsset(`${__dirname}/rds-init-fn-code`, {}),
      fnTimeout: cdk.Duration.minutes(2),
      fnSecurityGroups: [backendSG],
      vpc,
      subnetsSelection: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
      })
    })
    // manage resources dependency
    initializer.customResource.node.addDependency(this.dbCluster);
  }
}
