# A basic CDK TypeScript project

The basic infrastructure as below shows.

![](./images/playground-ecs.png)

Main components:

- Multiple regions & Three tiers network architecture
- Amazon RDS - MYSQL
- ECS Cluster managed by Auto Scaling Group
- Inernal-facing Application Load Balancer that targets several tasks running in ECS Cluster
- Private Hosted Zone & Route 53 A record that routes traffic to ALB

As we don't specify a domain name here, the basic design is not accessable from the Internet. However, for some cases that applications are only need to be accessable within company's private network or company uses other CDS services to manage its traffic from Internet, then this basic architecture should be a simple e to host an internal-facting web application with database.

## Stack Structure

| Stack Name            | Main AWS Resources                                                                   |
| --------------------- | ------------------------------------------------------------------------------------ |
| IamCdkStack           | ECS instance role and ECS task execution role                                        |
| VpcCdkStack           | VPC, Public Subnets, Private Subnets, Internet Gateway, NAT Gateway, Security Groups |
| EcsClusterCdkStack    | ECS Cluster, Instance Template, ASG                                                  |
| RdsCdkStack           | RDS MySQL Cluster                                                                    |
| EcsServiceAlbCdkStack | ECS Service, ALB, Target Group                                                       |
| HostedZoneStck        | Private Hosted Zone, A Record                                                        |

## Install Dependencies

```sh
# install CDK dependencies
npm install

# install RDS init lambda function dependencies
cd lib/rds-init-fn-code
npm install
cd -
```

## Build Stacks

```sh
npm run build
```

## Deploy all above stacks into AWS

```sh
npm run deploy
```

## Destory all above stacks into AWS

```sh
npm run destroy
```

## Other Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
