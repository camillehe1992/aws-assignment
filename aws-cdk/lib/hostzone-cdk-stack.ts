import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';

import conf from '../config/app.conf';

interface HostedZoneCdkStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class HostedZoneCdkStack extends cdk.Stack {
  
  public readonly hostedZone: route53.PrivateHostedZone;

  constructor(scope: Construct, id: string, props: HostedZoneCdkStackProps) {
    super(scope, id, props);

    const { vpc } = props;
    const { hostedZoneName } = conf;

    // Resources
    this.hostedZone = new route53.PrivateHostedZone(this, 'PrivateHostedZone', {
      vpc,
      zoneName: hostedZoneName
    });
  }
}