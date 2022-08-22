import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Template, Match } from "aws-cdk-lib/assertions";
import * as Stack from "../../lib/hostzone-cdk-stack";

import conf from '../../config/app.conf';

let app: cdk.App;
let stack: cdk.Stack;
let template: cdk.assertions.Template;

describe("HostedZoneCdkStack", () => {
  let vpc;
  let alb;

  beforeAll(() => {
    app = new cdk.App();
    // create reference stacks and resources
    const vpcStack = new cdk.Stack(app, "VpcCdkStack");
    vpc = new ec2.Vpc(vpcStack, "VPC", {});
    const ecsServiceAlbCdkStack = new cdk.Stack(app, 'EcsServiceAlbCdkStack');
    alb = new elbv2.ApplicationLoadBalancer(ecsServiceAlbCdkStack, 'ALB', {
      vpc
    });

    stack = new Stack.HostedZoneCdkStack(app, "HostedZoneCdkStack", {
      vpc,
      alb
    });
    template = Template.fromStack(stack);
  });

  test("should create a private hosted zone", () => {
    template.hasResourceProperties("AWS::Route53::HostedZone", Match.objectLike({
      Name: `${conf.hostedZoneName}.`
    }));
  });

  test("should create a A record in hosted zone", () => {
    template.hasResource("AWS::Route53::RecordSet", {});
  });

});
