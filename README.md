# AWS-assignment

This repo is used for AWS assignment, which includes a AWS CDK project and a NodeJS application for demo purpose.<b>

## AWS Infrastructure Diagram

![AWS Infrastructure Diagram](./assets//playground-ecs.png)

Main components:

- Three tiers network architecture
- Amazon RDS - MYSQL
- ECS Cluster managed by Auto Scaling Group
- Inernal-facing Application Load Balancer that targets several tasks running in ECS Cluster
- Route 53 A record that routes traffic to ALB

## Troubleshoting

1. ECS container instances failed to registered into ECS Cluster.

**Problem**

In a nutshell – when you use ECS to create a new cluster, it assumes this cluster will be on a Public Subnet. If you choose a Private subnet as the target network for deployment, the resulting instances won’t register back to ECS (ECS will continue to indicate zero running instances). This is because the container instances need to establish a connection back to the ECS management service, and this connection is over the Internet. On a private subnet they have no way to do this.

**Solution**

There is a way around this catch – you can use AWS’s NAT Gateway. This will allow hosts on your private subnets outbound Internet access, so that they can contact the ECS management service. See the details from [aws-container-services-private-subnets-tutorial][1]

2. Initialize a RDS database in Private subnet and security group programmically.

**Problem**
After provisioning Amazon RDS instances, it’s common for infrastructure engineers to require initialization or management processes, usually through SQL scripts.

**Solution**
Using AWS Lambda functions and AWS CloudFormation custom resources to bootstrap or maintain the database server with a structure that matches the requirements of dependent applications or services. See the details from [Use AWS CDK to initialize Amazon RDS instances][2]

[1]: https://www.topcoder.com/blog/aws-container-services-private-subnets-tutorial/#:~:text=For%20various%20reasons%2C%20you%20may%20wish%20to%20use,to%20reach%20ECS%20management.%20First%20a%20Few%20Definitions
[2]: https://aws.amazon.com/blogs/infrastructure-and-automation/use-aws-cdk-to-initialize-amazon-rds-instances/
