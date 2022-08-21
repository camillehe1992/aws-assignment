# CDK TypeScript project to build the entire workflow

## Prerequisites

1. AWS Account.
2. You have to have the [CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) installed and the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured.
3. Make sure your current AWS credential has access to create stack in your AWS account.
4. Your account should be boostrapped by `cdk boostrap`.

## Stack Structure

| Stack Name            | Main AWS Resources                                                                   | Remark |
| --------------------- | ------------------------------------------------------------------------------------ | ------ |
| IamCdkStack           | ECS instance role and ECS task execution role                                        |        |
| VpcCdkStack           | VPC, Public Subnets, Private Subnets, Internet Gateway, NAT Gateway, Security Groups |        |
| EcsClusterCdkStack    | ECS Cluster, Instance Template, ASG                                                  |        |
| RdsCdkStack           | RDS MySQL Cluster                                                                    |        |
| EcsServiceAlbCdkStack | ECS Service, ALB, Target Group                                                       |        |

## Install Dependencies

```sh
npm install
```

## Build Stacks
```sh
npm run build
```

## Deploy all above stacks into AWS

```sh
npm run deploy
```

## Troubleshooting

## Other Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
