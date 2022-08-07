import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import conf from '../config/app.conf';

export class SharedCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
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
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS
    });

    alb.addListener('passiveListener', {
      certificates: [listenerCertificate],
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
      port: 8443,
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

    // 👇 add the ALB DNS as an Output
    new cdk.CfnOutput(this, 'albDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}
