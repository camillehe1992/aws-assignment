import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import conf from '../config/app.conf';

export class SharedCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Mappings
    const deploymentMapping = new cdk.CfnMapping(this, 'deploymentMapping', {
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

    new ssm.StringParameter(this, 'albArn', {
      parameterName: '/SharedCdkStack/albArn',
      stringValue: alb.loadBalancerArn
    })
    
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
    
    const activeListener = new elbv2.ApplicationListener(this, 'ActiveListener', {
      loadBalancer: alb,
      certificates: [listenerCertificate],
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
      port: parseInt(deploymentMapping.findInMap('active', 'AlbPort')),
      protocol: elbv2.ApplicationProtocol.HTTPS
    });

    const passiveListener =  new elbv2.ApplicationListener(this, 'PassiveListener', {
      loadBalancer: alb,
      certificates: [listenerCertificate],
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
      port: parseInt(deploymentMapping.findInMap('passive', 'AlbPort')),
      protocol: elbv2.ApplicationProtocol.HTTPS
    });

    new elbv2.ApplicationListener(this, 'RedirectListener', {
      loadBalancer: alb,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: elbv2.ApplicationProtocol.HTTPS,
        port: '443'
      }),
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP
    });

    // Route53 record that points to ALB
    const zone = route53.PrivateHostedZone.fromLookup(this, 'PrivateHostedZone', {
      domainName: conf.hostedZoneName || '',
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

    new cdk.CfnOutput(this, 'ActiveListenerArn', {
      value: activeListener.listenerArn,
      exportName: `${conf.appName}-${conf.environment}-ActiveListener`
    });

    new cdk.CfnOutput(this, 'PassiveListenerArn', {
      value: passiveListener.listenerArn,
      exportName: `${conf.appName}-${conf.environment}-PassiveListener`
    });
  }
}
