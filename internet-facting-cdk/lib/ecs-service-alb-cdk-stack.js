"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcsServiceAlbCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const ecs = require("aws-cdk-lib/aws-ecs");
const iam = require("aws-cdk-lib/aws-iam");
const app_conf_1 = require("../config/app.conf");
class EcsServiceAlbCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        var _a, _b;
        super(scope, id, props);
        const { albIsInternetFacing, vpc, securityGroup, ecsCluster, secret } = props;
        const { appName, environment, ecsTaskExecutionRoleName, ecsTaskRoleName, image, taskMemoryMiB, taskCpu } = app_conf_1.default;
        // import ECS task execution role (workaround dependency cyclic reference issue)
        const executionRole = iam.Role.fromRoleName(this, 'EcsTaskExecutionRole', ecsTaskExecutionRoleName);
        // import ECS task role (workaround dependency cyclic reference issue)
        const taskRole = iam.Role.fromRoleName(this, 'EcsTaskRole', ecsTaskRoleName);
        // Resources
        const taskDefinition = new ecs.Ec2TaskDefinition(this, 'Ec2TaskDefinition', {
            executionRole,
            taskRole
        });
        taskDefinition.addContainer('TheContainer', {
            image: ecs.ContainerImage.fromRegistry(image),
            memoryLimitMiB: parseInt(taskMemoryMiB),
            cpu: parseInt(taskCpu),
            portMappings: [
                {
                    containerPort: 5000,
                    protocol: ecs.Protocol.TCP
                }
            ],
            logging: ecs.LogDriver.awsLogs({ streamPrefix: `${appName}`, logRetention: 7 }),
            environment: {
                ['AWS_SECRET_ID']: (_a = secret === null || secret === void 0 ? void 0 : secret.secretArn) !== null && _a !== void 0 ? _a : ''
            }
        });
        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ApplicationTargetGroup', {
            healthCheck: {
                path: '/health'
            },
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
            targetGroupName: `${appName}-${environment}-default`,
            targetType: elbv2.TargetType.INSTANCE,
            vpc
        });
        // create an alb
        const alb = new elbv2.ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
            vpc,
            idleTimeout: cdk.Duration.seconds(60),
            ipAddressType: elbv2.IpAddressType.IPV4,
            internetFacing: albIsInternetFacing,
            loadBalancerName: `${app_conf_1.default.appName}-${app_conf_1.default.environment}`,
            securityGroup,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            }
        });
        const albListener = new elbv2.ApplicationListener(this, 'ApplicationListener', {
            loadBalancer: alb,
            port: 80,
            defaultAction: elbv2.ListenerAction.forward([targetGroup])
        });
        const ecsService = new ecs.Ec2Service(this, 'Ec2Service', {
            cluster: ecsCluster,
            taskDefinition,
            deploymentController: {
                type: ecs.DeploymentControllerType.ECS,
            },
            desiredCount: parseInt((_b = app_conf_1.default.containerCount) !== null && _b !== void 0 ? _b : '1'),
            serviceName: `${app_conf_1.default.appName}-${app_conf_1.default.environment}-${app_conf_1.default.groupId}`,
        });
        ecsService.attachToApplicationTargetGroup(targetGroup);
        // setup autoscaling policy
        const scaleTarget = ecsService.autoScaleTaskCount({
            minCapacity: 1,
            maxCapacity: 2
        });
        scaleTarget.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 60,
            scaleInCooldown: cdk.Duration.seconds(60),
            scaleOutCooldown: cdk.Duration.seconds(60)
        });
    }
}
exports.EcsServiceAlbCdkStack = EcsServiceAlbCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLXNlcnZpY2UtYWxiLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVjcy1zZXJ2aWNlLWFsYi1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLDJDQUEyQztBQUMzQyxnRUFBZ0U7QUFDaEUsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUczQyxpREFBc0M7QUFVdEMsTUFBYSxxQkFBc0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNsRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWlDOztRQUN6RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzdFLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxHQUFHLGtCQUFJLENBQUM7UUFFaEgsZ0ZBQWdGO1FBQ2hGLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUN6QyxJQUFJLEVBQ0osc0JBQXNCLEVBQ3RCLHdCQUF3QixDQUN6QixDQUFDO1FBRUYsc0VBQXNFO1FBQ3RFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUNwQyxJQUFJLEVBQ0osYUFBYSxFQUNiLGVBQWUsQ0FDaEIsQ0FBQztRQUVGLFlBQVk7UUFDWixNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDMUUsYUFBYTtZQUNiLFFBQVE7U0FDVCxDQUFDLENBQUM7UUFFSCxjQUFjLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRTtZQUMxQyxLQUFLLEVBQUUs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cUIsQ0FBQyxZQUFZLEVBQUU7WUFDOUMsd0JBQXdCLEVBQUUsRUFBRTtZQUM1QixlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3pDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztTQUMzQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFsR0Qsc0RBa0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcclxuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xyXG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcyc7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcclxuaW1wb3J0ICogYXMgc3NtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZWNyZXRzbWFuYWdlcic7XHJcblxyXG5pbXBvcnQgY29uZiBmcm9tICcuLi9jb25maWcvYXBwLmNvbmYnO1xyXG5cclxuaW50ZXJmYWNlIEVjc1NlcnZpY2VBbGJDZGtTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xyXG4gIGFsYklzSW50ZXJuZXRGYWNpbmc6IGJvb2xlYW47XHJcbiAgdnBjOiBlYzIuVnBjO1xyXG4gIHNlY3VyaXR5R3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xyXG4gIGVjc0NsdXN0ZXI6IGVjcy5DbHVzdGVyO1xyXG4gIHNlY3JldD86IHNzbS5JU2VjcmV0XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFY3NTZXJ2aWNlQWxiQ2RrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBFY3NTZXJ2aWNlQWxiQ2RrU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgY29uc3QgeyBhbGJJc0ludGVybmV0RmFjaW5nLCB2cGMsIHNlY3VyaXR5R3JvdXAsIGVjc0NsdXN0ZXIsIHNlY3JldH0gPSBwcm9wcztcclxuICAgIGNvbnN0IHsgYXBwTmFtZSwgZW52aXJvbm1lbnQsIGVjc1Rhc2tFeGVjdXRpb25Sb2xlTmFtZSwgZWNzVGFza1JvbGVOYW1lLCBpbWFnZSwgdGFza01lbW9yeU1pQiwgdGFza0NwdSB9ID0gY29uZjtcclxuXHJcbiAgICAvLyBpbXBvcnQgRUNTIHRhc2sgZXhlY3V0aW9uIHJvbGUgKHdvcmthcm91bmQgZGVwZW5kZW5jeSBjeWNsaWMgcmVmZXJlbmNlIGlzc3VlKVxyXG4gICAgY29uc3QgZXhlY3V0aW9uUm9sZSA9IGlhbS5Sb2xlLmZyb21Sb2xlTmFtZShcclxuICAgICAgdGhpcyxcclxuICAgICAgJ0Vjc1Rhc2tFeGVjdXRpb25Sb2xlJyxcclxuICAgICAgZWNzVGFza0V4ZWN1dGlvblJvbGVOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGltcG9ydCBFQ1MgdGFzayByb2xlICh3b3JrYXJvdW5kIGRlcGVuZGVuY3kgY3ljbGljIHJlZmVyZW5jZSBpc3N1ZSlcclxuICAgIGNvbnN0IHRhc2tSb2xlID0gaWFtLlJvbGUuZnJvbVJvbGVOYW1lKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICAnRWNzVGFza1JvbGUnLFxyXG4gICAgICBlY3NUYXNrUm9sZU5hbWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gUmVzb3VyY2VzXHJcbiAgICBjb25zdCB0YXNrRGVmaW5pdGlvbiA9IG5ldyBlY3MuRWMyVGFza0RlZmluaXRpb24odGhpcywgJ0VjMlRhc2tEZWZpbml0aW9uJywge1xyXG4gICAgICBleGVjdXRpb25Sb2xlLFxyXG4gICAgICB0YXNrUm9sZVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRhc2tEZWZpbml0aW9uLmFkZENvbnRhaW5lcignVGhlQ29udGFpbmVyJywge1xyXG4gICAgICBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21SZWdpc3RyeShpbWFnZSksXHJcbiAgICAgIG1lbW9yeUxpbWl0TWlCOiBwYXJzZUludCh0YXNrTWVtb3J5TWlCKSxcclxuICAgICAgY3B1OiBwYXJzZUludCh0YXNrQ3B1KSxcclxuICAgICAgcG9ydE1hcHBpbmdzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY29udGFpbmVyUG9ydDogNTAwMCxcclxuICAgICAgICAgIHByb3RvY29sOiBlY3MuUHJvdG9jb2wuVENQXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBsb2dnaW5nOiBlY3MuTG9nRHJpdmVyLmF3c0xvZ3MoeyBzdHJlYW1QcmVmaXg6IGAke2FwcE5hbWV9YCwgbG9nUmV0ZW50aW9uOiA3IH0pLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIFsnQVdTX1NFQ1JFVF9JRCddOiBzZWNyZXQ/LnNlY3JldEFybiA/PyAnJ1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCB0YXJnZXRHcm91cCA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKHRoaXMsICdBcHBsaWNhdGlvblRhcmdldEdyb3VwJywge1xyXG4gICAgICBoZWFsdGhDaGVjazoge1xyXG4gICAgICAgIHBhdGg6ICcvaGVhbHRoJ1xyXG4gICAgICB9LFxyXG4gICAgICBwb3J0OiA4MCxcclxuICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcclxuICAgICAgcHJvdG9jb2xWZXJzaW9uOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sVmVyc2lvbi5IVFRQMSxcclxuICAgICAgdGFyZ2V0R3JvdXBOYW1lOiBgJHthcHBOYW1lfS0ke2Vudmlyb25tZW50fS1kZWZhdWx0YCxcclxuICAgICAgdGFyZ2V0VHlwZTogZWxidjIuVGFyZ2V0VHlwZS5JTlNUQU5DRSxcclxuICAgICAgdnBjXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW4gYWxiXHJcbiAgICBjb25zdCBhbGIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIodGhpcywgJ0FwcGxpY2F0aW9uTG9hZEJhbGFuY2VyJywge1xyXG4gICAgICB2cGMsXHJcbiAgICAgIGlkbGVUaW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXHJcbiAgICAgIGlwQWRkcmVzc1R5cGU6IGVsYnYyLklwQWRkcmVzc1R5cGUuSVBWNCxcclxuICAgICAgaW50ZXJuZXRGYWNpbmc6IGFsYklzSW50ZXJuZXRGYWNpbmcsXHJcbiAgICAgIGxvYWRCYWxhbmNlck5hbWU6IGAke2NvbmYuYXBwTmFtZX0tJHtjb25mLmVudmlyb25tZW50fWAsXHJcbiAgICAgIHNlY3VyaXR5R3JvdXAsXHJcbiAgICAgIHZwY1N1Ym5ldHM6IHtcclxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgYWxiTGlzdGVuZXIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25MaXN0ZW5lcih0aGlzLCAnQXBwbGljYXRpb25MaXN0ZW5lcicsIHtcclxuICAgICAgbG9hZEJhbGFuY2VyOiBhbGIsXHJcbiAgICAgIHBvcnQ6IDgwLFxyXG4gICAgICBkZWZhdWx0QWN0aW9uOiBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi5mb3J3YXJkKFt0YXJnZXRHcm91cF0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBlY3NTZXJ2aWNlID0gbmV3IGVjcy5FYzJTZXJ2aWNlKHRoaXMsICdFYzJTZXJ2aWNlJywge1xyXG4gICAgICBjbHVzdGVyOiBlY3NDbHVzdGVyLFxyXG4gICAgICB0YXNrRGVmaW5pdGlvbixcclxuICAgICAgZGVwbG95bWVudENvbnRyb2xsZXI6ICB7XHJcbiAgICAgICAgdHlwZTogZWNzLkRlcGxveW1lbnRDb250cm9sbGVyVHlwZS5FQ1MsXHJcbiAgICAgIH0sXHJcbiAgICAgIGRlc2lyZWRDb3VudDogcGFyc2VJbnQoY29uZi5jb250YWluZXJDb3VudCA/PyAnMScpLFxyXG4gICAgICBzZXJ2aWNlTmFtZTogYCR7Y29uZi5hcHBOYW1lfS0ke2NvbmYuZW52aXJvbm1lbnR9LSR7Y29uZi5ncm91cElkfWAsXHJcbiAgICB9KTtcclxuXHJcbiAgICBlY3NTZXJ2aWNlLmF0dGFjaFRvQXBwbGljYXRpb25UYXJnZXRHcm91cCh0YXJnZXRHcm91cCk7XHJcblxyXG4gICAgLy8gc2V0dXAgYXV0b3NjYWxpbmcgcG9saWN5XHJcbiAgICBjb25zdCBzY2FsZVRhcmdldCA9IGVjc1NlcnZpY2UuYXV0b1NjYWxlVGFza0NvdW50KHtcclxuICAgICAgbWluQ2FwYWNpdHk6IDEsXHJcbiAgICAgIG1heENhcGFjaXR5OiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICBzY2FsZVRhcmdldC5zY2FsZU9uQ3B1VXRpbGl6YXRpb24oJ0NwdVNjYWxpbmcnLCB7XHJcbiAgICAgIHRhcmdldFV0aWxpemF0aW9uUGVyY2VudDogNjAsXHJcbiAgICAgIHNjYWxlSW5Db29sZG93bjogY2RrLkR1cmF0aW9uLnNlY29uZHMoNjApLFxyXG4gICAgICBzY2FsZU91dENvb2xkb3duOiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MClcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=