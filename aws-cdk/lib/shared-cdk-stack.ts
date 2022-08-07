import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

import conf from '../config/app.conf';

export class SharedCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Mappings
    const deploymentTable = new cdk.CfnMapping(this, 'DeploymentTable', {
      mapping: {
        'active': {
          AlbPort: 443,
        },
        'passive': {
          AlbPort: 8443,
        }
      },
      lazy: true
    });
    
    // 👇 import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'main-vpc',
    });

    // 👇 import Database Security Group by Name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'web-server-sg', vpc)
    
    // 👇 create a alb
    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
      vpc,
      idleTimeout: cdk.Duration.seconds(60),
      ipAddressType: elbv2.IpAddressType.IPV4,
      loadBalancerName: `${conf.appName}-${conf.environment}`,
      securityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });
    
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'targetGroup', {
      healthCheck: {
        path: '/health',
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 5,
        interval: cdk.Duration.seconds(30),
      },
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
      targetGroupName: 'DefaultTargetGroup',
      targetType: elbv2.TargetType.INSTANCE,
      vpc
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const listenerCertificate = elbv2.ListenerCertificate.fromArn(conf.certArn!);

    alb.addListener('activeListener', {
      certificates: [listenerCertificate],
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
      port: parseInt(deploymentTable.findInMap('active', 'AlbPort')),
      protocol: elbv2.ApplicationProtocol.HTTPS
    });

    alb.addListener('passiveListener', {
      certificates: [listenerCertificate],
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
      port: parseInt(deploymentTable.findInMap('passive', 'AlbPort')),
      protocol: elbv2.ApplicationProtocol.HTTPS
    });

    alb.addListener('redirectListener', {
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: elbv2.ApplicationProtocol.HTTPS,
        port: '443'
      }),
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP
    });

    // Route53 record that points to ALB
    const zone = route53.HostedZone.fromLookup(this, 'PrivateHostedZone', {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      domainName: conf.hostedZoneName!,
      privateZone: true,
      vpcId: vpc.vpcId
    });

    new route53.RecordSet(this, 'AliasRecord', {
      recordType: route53.RecordType.A,
      zone,
      recordName: `${conf.appName}-${conf.region}-${conf.environment}`,
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb))
    });

    // 👇 add the ALB DNS as an Output
    new cdk.CfnOutput(this, 'albDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}
