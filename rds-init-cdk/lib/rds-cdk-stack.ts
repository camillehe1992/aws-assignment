import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cwlogs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ResourceInitializerCdkStack } from '../lib/resource-initializer';

interface RdsCdkStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  backendSG: ec2.SecurityGroup,
  dbSG: ec2.SecurityGroup;
}

export class RdsCdkStack extends cdk.Stack {
  
  public readonly dbInstance: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: RdsCdkStackProps) {
    super(scope, id, props);

    const { vpc, backendSG, dbSG } = props;

    const instanceIdentifier = 'mysql-01';
    const credsSecretName = `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase()
    const credentials = new rds.DatabaseSecret(this, 'MysqlRdsCredentials', {
      secretName: credsSecretName,
      username: 'clusteradmin'
    });

    this.dbInstance = new rds.DatabaseInstance(this, "MysqlInstance", {
      engine: rds.DatabaseInstanceEngine.MYSQL,
      credentials: rds.Credentials.fromSecret(credentials),
      vpc,
      instanceIdentifier,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
        ),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      securityGroups: [dbSG]
    });

    const initializer = new ResourceInitializerCdkStack(this, 'MyRdsInit', {
      config: {
        credsSecretName: credsSecretName
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
    initializer.customResource.node.addDependency(this.dbInstance);
  }
}
