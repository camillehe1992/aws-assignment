import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
 

import conf from '../config/app.conf';

interface HostedZoneCdkStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  alb: elbv2.ApplicationLoadBalancer;
}

export class HostedZoneCdkStack extends cdk.Stack {
  
  public readonly hostedZone: route53.PrivateHostedZone;

  constructor(scope: Construct, id: string, props: HostedZoneCdkStackProps) {
    super(scope, id, props);

    const { vpc, alb } = props;
    const { appName, environment, hostedZoneName } = conf;

    // Resources
    this.hostedZone = new route53.PrivateHostedZone(this, 'PrivateHostedZone', {
      vpc,
      zoneName: hostedZoneName
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb)),
      recordName: `${appName}-${environment}`
    });
  }
}