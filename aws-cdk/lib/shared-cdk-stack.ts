import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
// import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import conf from '../config/app.conf';

// import { VpcCdkStack } from './vpc-cdk-stack';

export class SharedCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dependency stacks
    // const vpcCdkStack = new VpcCdkStack(scope, 'VpcCdkStack') 
    // this.addDependency(vpcCdkStack);

    // import VPC by Name
    const vpc = ec2.Vpc.fromLookup(this, 'MainVpc', {
      vpcName: 'MainVpc',
    });

    // import database security group by name
    const securityGroup = ec2.SecurityGroup.fromLookupByName(this, 'SG', 'web-server-sg', vpc);
    
    // create a alb
    const alb = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc,
      idleTimeout: cdk.Duration.seconds(60),
      ipAddressType: elbv2.IpAddressType.IPV4,
      loadBalancerName: `${conf.appName}-${conf.environment}`,
      securityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    // save albArn into ssm so that it can be associated in other stacks
    new ssm.StringParameter(this, 'AlbArn', {
      parameterName: `/${this.stackName}/albArn`,
      stringValue: alb.loadBalancerArn
    });
    
    // const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
    //   healthCheck: {
    //     path: '/health',
    //     unhealthyThresholdCount: 2,
    //     healthyThresholdCount: 5,
    //     interval: cdk.Duration.seconds(30),
    //   },
    //   port: 80,
    //   protocol: elbv2.ApplicationProtocol.HTTP,
    //   protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
    //   targetGroupName: `${conf.appName}-${conf.environment}-default`,
    //   targetType: elbv2.TargetType.INSTANCE,
    //   vpc
    // });

    // const albListener = new elbv2.ApplicationListener(this, 'AlbListener', {
    //   loadBalancer: alb,
    //   port: 80,
    //   defaultAction: elbv2.ListenerAction.forward([targetGroup])
    // });

    // const albListener2 = new elbv2.ApplicationListener(this, 'AlbListener2', {
    //   loadBalancer: alb,
    //   port: 443,
    //   defaultAction: elbv2.ListenerAction.forward([targetGroup])
    // });


    // Route53 record that points to ALB
    // const zone = route53.PrivateHostedZone.fromLookup(this, 'PrivateHostedZone', {
    //   domainName: conf.hostedZoneName || '',
    //   privateZone: true,
    //   vpcId: vpc.vpcId
    // });

    // new route53.ARecord(this, 'AliasRecord', {
    //   zone,
    //   recordName: `${conf.appName}-${conf.environment}-${conf.region}`,
    //   target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb))
    // });

    // Outputs
    new cdk.CfnOutput(this, 'AlbDNSName', {
      value: alb.loadBalancerDnsName,
      exportName: 'AlbDNSName'
    });

    // new cdk.CfnOutput(this, 'AlbListenerArn', {
    //   value: albListener.listenerArn,
    //   exportName: 'AlbListenerArn'
    // });
  }
}
