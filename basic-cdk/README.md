# A basic CDK TypeScript project

For the basic project, we deploy our application in ECS cluster that managed by ASG. We create an internal-facing ALB to route traffic to the target group with several ECS tasks registered. Besides, we create a Private Hosted Zone and A record with ALB (regional endpoint) as target in Route 53. As Route 53 is a global service, it helps route traffic between multiple regions if our application is multi-region enabled.

The basic infrastructure as below shows.

![](./images/basic-digram.png)

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
| EcsServiceAlbCdkStack | ECS Service, ALB, Target Group, A internal-facing ALB                                |
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
# cp .env.sample to .env, and replace `AWS_ACCOUNT_ID` and `AWS_REGION`
npm run build
```

## Deploy all above stacks into AWS

```sh
# take a cup of coffee, as the whole deployment will spend about 25 mins
npm run deploy
```

After deployment is done, verify all stacks is created completed. As the application is internal-facing, in order to test it, you can launch an EC2 instance in the VPC you just created and choose `web-server-sg`. SSH into EC2, and curl the application ALB DNS, for example `internal-pokemon-dev-xxxxxxxxx.ap-south-1.elb.amazonaws.com`, it should return a HTML of application home page. Besides, you can check if the application server is up via health check route `internal-pokemon-dev-xxxxxxxxx.ap-south-1.elb.amazonaws.com/health`.

## Destory all stacks into AWS

```sh
# clear up resources to reduce cost. If you create a EC2 to verify the application, DON'T forget to terminate it before clear up all resources.
npm run destroy
```

## Throubleshooting

1. Get `SERVER IS UP` from health check endpoint, but fail to reach home page.

When MYSQL database is created, there is no database and tables on it. We use a Lambda function `MyRdsInit-ResInitRdsCdkStack` to initialize database and tables. But sometimes function cannot be invoked successfully during deploying. If you found error logs `sqlMessage: "Unknown database 'socka'",` from task logs, you need to invoke the function manually with a JSON payload in Console.

You can get the name of secret from secret manager console

```
{
  "params": {
    "config": {
      "credsSecretName": "The name of secret"
    }
  }
}
```

## Other Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
