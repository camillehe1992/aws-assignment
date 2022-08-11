import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';

import conf from '../config/app.conf';

export class HostedZoneCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters
    const hostedZoneName = new cdk.CfnParameter(this, "HostedZoneName", {
      type: 'String',
      description: 'The name of priviate hosted zone',
      default: conf.hostedZoneName
    });

    // Imports
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'main-vpc',
    });

    // Resources
    const hostedZone = new route53.PrivateHostedZone(this, 'HostedZone', {
      zoneName: hostedZoneName.valueAsString,
      vpc
    });

    // Ouputs
    new cdk.CfnOutput(this, 'PrivateHostedZoneName', {
      value: hostedZone.zoneName,
      description: 'The name of private hosted zone',
      exportName: 'PrivateHostedZoneName'
    });
  }
}