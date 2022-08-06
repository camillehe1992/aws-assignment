import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

export class AcmCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'main-vpc',
    });

    const hostedZone = new route53.PrivateHostedZone(this, 'HostedZone', {
      zoneName: 'camille.awesome.com',
      vpc
    });

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: 'camille.awesome.com',
      subjectAlternativeNames: [],
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });

    // Ouputs
    new cdk.CfnOutput(this, 'domainName', {
      value: hostedZone.zoneName,
    });

    new cdk.CfnOutput(this, 'certificateArn', {
      value: certificate.certificateArn,
      exportName: 'certificateArn'
    });
  }
}