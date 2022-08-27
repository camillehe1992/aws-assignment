# An Implementation CDK TypeScript project

Reference here https://aws.amazon.com/blogs/infrastructure-and-automation/use-aws-cdk-to-initialize-amazon-rds-instances/

## Stack Structure

| Stack Name  | Main AWS Resources                                                                   |
| ----------- | ------------------------------------------------------------------------------------ |
| VpcCdkStack | VPC, Public Subnets, Private Subnets, Internet Gateway, NAT Gateway, Security Groups |
| RdsCdkStack | RDS MySQL Database                                                                   |

| ResourceIni

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

## Throubleshooting

1. Check lambda function logs to verify the provison process works.

When MYSQL database is created, there is no database and tables on it. We use a Lambda function `MyRdsInit-ResInitRdsCdkStack` to initialize database and tables. But sometimes function cannot be invoked successfully during deploying. If you found error logs `sqlMessage: "Unknown database 'pokemon'",` from task logs, you need to invoke the function manually with a JSON payload in Console.

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
