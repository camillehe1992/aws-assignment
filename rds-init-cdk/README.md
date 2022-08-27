# An Implementation CDK TypeScript project

Reference here https://aws.amazon.com/blogs/infrastructure-and-automation/use-aws-cdk-to-initialize-amazon-rds-instances/

**Note**: In order to deploy the infrastructure on local machine without Docker installed, the lambda function initialization source code `rds-init-fn-code` is imported from local files instead of docker image. So the source code dependencies, such as mysql package should be installed before deploy stacks. Don't need to install aws-cdk, as it's already reinstalled in lambda function runtime when created.

In rds-cdk-stack.ts:

```sh
# Original:
fnCode: DockerImageCode.fromImageAsset(`${__dirname}/rds-init-fn-code`, {});

# Updated:
fnCode: lambda.Code.fromAsset(`${__dirname}/rds-init-fn-code`, {});
```

In resource-initializer.ts

```sh
# Original:
const fn = new lambda.DockerImageFunction(this, 'ResourceInitializerFn', {
  code: props.fnCode,
  ...
});

# Updated:
const fn = new lambda.Function(this, 'ResourceInitializerCdkStackFn', {
  code: props.fnCode,
  ...
}
```

## Stack Structure

| Stack Name  | Main AWS Resources                                                                   |
| ----------- | ------------------------------------------------------------------------------------ |
| VpcCdkStack | VPC, Public Subnets, Private Subnets, Internet Gateway, NAT Gateway, Security Groups |
| RdsCdkStack | RDS MySQL Database                                                                   |

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

After deployment is done, verify all stacks is created completed.

## Destory all stacks into AWS

```sh
# clear up resources to reduce cost. If you create a EC2 to verify the application, DON'T forget to terminate it before clear up all resources.
npm run destroy
```

## Other Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
