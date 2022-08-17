import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create the VPC and s3 gateway endpoint
    const vpc = new ec2.Vpc(this, 'MainVpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      natGatewaySubnets: {
        availabilityZones: ['ap-south-1a'],
        subnetType: ec2.SubnetType.PUBLIC
      },
      maxAzs: 3,
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
    const webserverSG = new ec2.SecurityGroup(this, 'web-server-sg', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'web-server-sg',
      description: 'security group for a web server',
    });

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere',
    );

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow HTTP traffic from anywhere on port 80',
    );

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'allow HTTPS traffic from anywhere on port 443',
    );

    // create a security group for a backend server tier
    const backendServerSG = new ec2.SecurityGroup(this, 'backend-server-sg', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'backend-server-sg',
      description: 'security group for a backend server',
    });

    backendServerSG.connections.allowFrom(
      new ec2.Connections({
        securityGroups: [webserverSG],
      }),
      ec2.Port.tcp(8000),
      'allow traffic on port 8000 from the webserver security group',
    );

    backendServerSG.connections.allowFrom(
      new ec2.Connections({
        securityGroups: [webserverSG],
      }),
      ec2.Port.tcp(22),
      'allow traffic on port 22 from the webserver security group for testing purpose',
    );

    // create a security group for a database server tier
    const dbserverSG = new ec2.SecurityGroup(this, 'database-server-sg', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'database-server-sg',
      description: 'security group for a database server',
    });

    dbserverSG.connections.allowFrom(
      new ec2.Connections({
        securityGroups: [backendServerSG],
      }),
      ec2.Port.tcp(3306),
      'allow traffic on port 3306 from the backend server security group',
    );

    backendServerSG.node.addDependency(webserverSG);
    dbserverSG.node.addDependency(backendServerSG);
  }
}
