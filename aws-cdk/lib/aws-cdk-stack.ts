import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';

export class AwsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a vpc corss 2 AZs and a public subnet in each AZ
    const vpc = new Vpc(this, 'MainVpc', {
      maxAzs: 2,
      subnetConfiguration:  [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: SubnetType.PUBLIC
        },
      ]
    });
  }
}
