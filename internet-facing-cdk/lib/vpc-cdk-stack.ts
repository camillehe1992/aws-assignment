import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcCdkStack extends cdk.Stack {
  
  public readonly vpc: ec2.Vpc;
  public readonly webserverSG: ec2.SecurityGroup;
  public readonly backendServerSG: ec2.SecurityGroup;
  public readonly dbserverSG: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create the VPC and other necessary network resources
    this.vpc = new ec2.Vpc(this, 'MainVpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      natGatewaySubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      maxAzs: 2,
      vpcName: 'MainVpc',
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        }
      },
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 28,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
        }
      ],
    });
  
    // create a security group for a web server tier
    this.webserverSG = new ec2.SecurityGroup(this, 'WebServerSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: 'web-server-sg',
      description: 'security group for a web server',
    });

    this.webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere',
    );

    this.webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow HTTP traffic from anywhere on port 80',
    );

    // create a security group for a backend server tier
    this.backendServerSG = new ec2.SecurityGroup(this, 'BackendServerSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: 'backend-server-sg',
      description: 'security group for a backend server',
    });

    this.backendServerSG.connections.allowFrom(
      new ec2.Connections({
        securityGroups: [this.webserverSG],
      }),
      ec2.Port.allTraffic(),
      'allow all traffic from the webserver security group',
    );

    // create a security group for a database server tier
    this.dbserverSG = new ec2.SecurityGroup(this, 'DatabaseServerSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: 'database-server-sg',
      description: 'security group for a database server',
    });

    this.dbserverSG.connections.allowFrom(
      new ec2.Connections({
        securityGroups: [this.backendServerSG],
      }),
      ec2.Port.tcp(3306),
      'allow traffic on port 3306 from the backend server security group',
    );
  }
}
