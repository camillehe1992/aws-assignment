"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const app_conf_1 = require("../config/app.conf");
class IamCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { ec2InstanceRoleName, ecsTaskExecutionRoleName, ecsTaskRoleName } = app_conf_1.default;
        // create an IAM role to associate with the instance profile that is used by ECS container instances    
        this.ec2InstanceRole = new iam.Role(this, 'EC2InstanceRole', {
            description: 'The role is assumed by EC2 instances running in ECS Cluster',
            roleName: ec2InstanceRoleName,
            assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ec2.amazonaws.com'), new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role')
            ],
            inlinePolicies: {
                ['allow-autoscaling-policy']: new iam.PolicyDocument({
                    statements: [new iam.PolicyStatement({
                            actions: [
                                'autoscaling:DescribeAutoScalingInstances',
                                'autoscaling:CompleteLifecycleAction',
                                'autoscaling:DescribeLifecycleHooks'
                            ],
                            resources: ['*'],
                            effect: iam.Effect.ALLOW
                        })]
                })
            }
        });
        // create an ECS task definition execution IAM role   
        this.ecsTaskExecutionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
            description: 'The role is required by tasks to pull container images and publish logs to CW',
            roleName: ecsTaskExecutionRoleName,
            assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
            inlinePolicies: {
                ['allow-cloudwatch-policy']: new iam.PolicyDocument({
                    statements: [new iam.PolicyStatement({
                            actions: [
                                'logs:CreateLogStream',
                                'logs:PutLogEvents'
                            ],
                            resources: ['*'],
                            effect: iam.Effect.ALLOW
                        })]
                })
            }
        });
        // create an ECS task definition execution IAM role   
        this.ecsTaskRole = new iam.Role(this, 'EcsTaskRole', {
            description: 'The role is used for task that running in ECS container instances',
            roleName: ecsTaskRoleName,
            assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
            inlinePolicies: {
                ['allow-secret-manager-readonly-policy']: new iam.PolicyDocument({
                    statements: [new iam.PolicyStatement({
                            actions: [
                                'secretsmanager:GetSecretValue'
                            ],
                            resources: ['*'],
                            effect: iam.Effect.ALLOW
                        })]
                })
            }
        });
    }
}
exports.IamCdkStack = IamCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImlhbS1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLDJDQUEyQztBQUUzQyxpREFBc0M7QUFFdEMsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFNeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsbUJBQW1CLEVBQUUsd0JBQXdCLEVBQUUsZUFBZSxFQUFFLEdBQUcsa0JBQUksQ0FBQztRQUVoRix3R0FBd0c7UUFDeEcsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQzNELFdBQVcsRUFBRSw2REFBNkQ7WUFDMUUsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsa0JBQWtCLENBQ25DLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLEVBQzdDLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQ3BEO1lBQ0QsZUFBZSxFQUFFO2dCQUNmLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsa0RBQWtELENBQUM7YUFDL0Y7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQztvQkFDbkQsVUFBVSxFQUFFLENBQUUsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDOzRCQUNwQyxPQUFPLEVBQUU7Z0NBQ1AsMENBQTBDO2dDQUMxQyxxQ0FBcUM7Z0NBQ3JDLG9DQUFvQzs2QkFDckM7NEJBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDOzRCQUNoQixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO3lCQUN6QixDQUFDLENBQUM7aUJBQ0osQ0FBQzthQUNIO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQ3JFLFdBQVcsRUFBRSwrRUFBK0U7WUFDNUYsUUFBUSxFQUFFLHdCQUF3QjtZQUNsQyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsa0JBQWtCLENBQ25DLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQ3BEO1lBQ0QsY0FBYyxFQUFFO2dCQUNkLENBQUMseUJBQXlCLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUM7b0JBQ2xELFVBQVUsRUFBRSxDQUFFLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQzs0QkFDcEMsT0FBTyxFQUFFO2dDQUNQLHNCQUFzQjtnQ0FDdEIsbUJBQW1COzZCQUNwQjs0QkFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7NEJBQ2hCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7eUJBQ3pCLENBQUMsQ0FBQztpQkFDSixDQUFDO2FBQ0g7U0FDRixDQUFDLENBQUM7UUFFSCxzREFBc0Q7UUFDdEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNuRCxXQUFXLEVBQUUsbUVBQW1FO1lBQ2hGLFFBQVEsRUFBRSxlQUFlO1lBQ3pCLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxrQkFBa0IsQ0FDbkMsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsQ0FDcEQ7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQztvQkFDL0QsVUFBVSxFQUFFLENBQUUsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDOzRCQUNwQyxPQUFPLEVBQUU7Z0NBQ1AsK0JBQStCOzZCQUNoQzs0QkFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7NEJBQ2hCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7eUJBQ3pCLENBQUMsQ0FBQztpQkFDSixDQUFDO2FBQ0g7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE5RUQsa0NBOEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcclxuXHJcbmltcG9ydCBjb25mIGZyb20gJy4uL2NvbmZpZy9hcHAuY29uZic7XHJcblxyXG5leHBvcnQgY2xhc3MgSWFtQ2RrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgZWMySW5zdGFuY2VSb2xlOiBpYW0uUm9sZTtcclxuICBwdWJsaWMgcmVhZG9ubHkgZWNzVGFza0V4ZWN1dGlvblJvbGU6IGlhbS5Sb2xlO1xyXG4gIHB1YmxpYyByZWFkb25seSBlY3NUYXNrUm9sZTogaWFtLlJvbGU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIGNvbnN0IHsgZWMySW5zdGFuY2VSb2xlTmFtZSwgZWNzVGFza0V4ZWN1dGlvblJvbGVOYW1lLCBlY3NUYXNrUm9sZU5hbWUgfSA9IGNvbmY7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuIElBTSByb2xlIHRvIGFzc29jaWF0ZSB3aXRoIHRoZSBpbnN0YW5jZSBwcm9maWxlIHRoYXQgaXMgdXNlZCBieSBFQ1MgY29udGFpbmVyIGluc3RhbmNlcyAgICBcclxuICAgIHRoaXMuZWMySW5zdGFuY2VSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdFQzJJbnN0YW5jZVJvbGUnLCB7XHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHJvbGUgaXMgYXNzdW1lZCBieSBFQzIgaW5zdGFuY2VzIHJ1bm5pbmcgaW4gRUNTIENsdXN0ZXInLFxyXG4gICAgICByb2xlTmFtZTogZWMySW5zdGFuY2VSb2xlTmFtZSxcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLkNvbXBvc2l0ZVByaW5jaXBhbChcclxuICAgICAgICBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2VjMi5hbWF6b25hd3MuY29tJyksXHJcbiAgICAgICAgbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpXHJcbiAgICAgICksXHJcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xyXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FtYXpvbkVDMkNvbnRhaW5lclNlcnZpY2Vmb3JFQzJSb2xlJylcclxuICAgICAgXSxcclxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcclxuICAgICAgICBbJ2FsbG93LWF1dG9zY2FsaW5nLXBvbGljeSddOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFsgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgJ2F1dG9zY2FsaW5nOkRlc2NyaWJlQXV0b1NjYWxpbmdJbnN0YW5jZXMnLFxyXG4gICAgICAgICAgICAgICdhdXRvc2NhbGluZzpDb21wbGV0ZUxpZmVjeWNsZUFjdGlvbicsXHJcbiAgICAgICAgICAgICAgJ2F1dG9zY2FsaW5nOkRlc2NyaWJlTGlmZWN5Y2xlSG9va3MnXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHJlc291cmNlczogWycqJ10sXHJcbiAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPV1xyXG4gICAgICAgICAgfSldXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuIEVDUyB0YXNrIGRlZmluaXRpb24gZXhlY3V0aW9uIElBTSByb2xlICAgXHJcbiAgICB0aGlzLmVjc1Rhc2tFeGVjdXRpb25Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdFY3NUYXNrRXhlY3V0aW9uUm9sZScsIHtcclxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgcm9sZSBpcyByZXF1aXJlZCBieSB0YXNrcyB0byBwdWxsIGNvbnRhaW5lciBpbWFnZXMgYW5kIHB1Ymxpc2ggbG9ncyB0byBDVycsXHJcbiAgICAgIHJvbGVOYW1lOiBlY3NUYXNrRXhlY3V0aW9uUm9sZU5hbWUsXHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5Db21wb3NpdGVQcmluY2lwYWwoXHJcbiAgICAgICAgbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpXHJcbiAgICAgICksXHJcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XHJcbiAgICAgICAgWydhbGxvdy1jbG91ZHdhdGNoLXBvbGljeSddOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFsgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcclxuICAgICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHJlc291cmNlczogWycqJ10sXHJcbiAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPV1xyXG4gICAgICAgICAgfSldXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuIEVDUyB0YXNrIGRlZmluaXRpb24gZXhlY3V0aW9uIElBTSByb2xlICAgXHJcbiAgICB0aGlzLmVjc1Rhc2tSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdFY3NUYXNrUm9sZScsIHtcclxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgcm9sZSBpcyB1c2VkIGZvciB0YXNrIHRoYXQgcnVubmluZyBpbiBFQ1MgY29udGFpbmVyIGluc3RhbmNlcycsXHJcbiAgICAgIHJvbGVOYW1lOiBlY3NUYXNrUm9sZU5hbWUsXHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5Db21wb3NpdGVQcmluY2lwYWwoXHJcbiAgICAgICAgbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpXHJcbiAgICAgICksXHJcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XHJcbiAgICAgICAgWydhbGxvdy1zZWNyZXQtbWFuYWdlci1yZWFkb25seS1wb2xpY3knXTogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XHJcbiAgICAgICAgICBzdGF0ZW1lbnRzOiBbIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgICAgICAgYWN0aW9uczogW1xyXG4gICAgICAgICAgICAgICdzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZSdcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcclxuICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XXHJcbiAgICAgICAgICB9KV1cclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn0iXX0=