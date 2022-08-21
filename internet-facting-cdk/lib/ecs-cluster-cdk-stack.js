"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcsClusterCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const ecs = require("aws-cdk-lib/aws-ecs");
const autoscaling = require("aws-cdk-lib/aws-autoscaling");
const iam = require("aws-cdk-lib/aws-iam");
const app_conf_1 = require("../config/app.conf");
class EcsClusterCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { vpc, securityGroup } = props;
        const { ec2InstanceRoleName, ecsClusterName, ec2InstanceType, keyPairName } = app_conf_1.default;
        // import ECS container instance IAM role (workaround dependency cyclic reference issue)
        const instanceRole = iam.Role.fromRoleName(this, 'Ec2InstanceRole', ec2InstanceRoleName);
        const keyPair = new ec2.CfnKeyPair(this, 'CfnKeyPair', {
            keyName: keyPairName,
            tags: [{
                    key: 'StackName',
                    value: this.stackName,
                }],
        });
        // create a EC2 launch template
        const launchTemplate = new ec2.LaunchTemplate(this, 'ASG-LaunchTemplate', {
            instanceType: new ec2.InstanceType(ec2InstanceType),
            machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
            userData: ec2.UserData.forLinux(),
            securityGroup: securityGroup,
            role: instanceRole,
            keyName: keyPair.keyName,
            launchTemplateName: this.stackName + '-launch-template'
        });
        // create auto scaling group for ECS cluster
        const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
            vpc,
            launchTemplate: launchTemplate,
            updatePolicy: autoscaling.UpdatePolicy.rollingUpdate()
        });
        // create an ECS cluster
        this.ecsCluster = new ecs.Cluster(this, 'ECSCluster', {
            vpc,
            clusterName: ecsClusterName,
        });
        // create a capacity provider and associate it with ECS cluster
        const capacityProvider = new ecs.AsgCapacityProvider(this, 'AsgCapacityProvider', {
            autoScalingGroup,
            enableManagedScaling: true,
            capacityProviderName: 'AsgCapacityProvider',
            enableManagedTerminationProtection: false
        });
        this.ecsCluster.addAsgCapacityProvider(capacityProvider);
    }
}
exports.EcsClusterCdkStack = EcsClusterCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLWNsdXN0ZXItY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWNzLWNsdXN0ZXItY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLDJEQUEyRDtBQUMzRCwyQ0FBMkM7QUFFM0MsaURBQXNDO0FBT3RDLE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJL0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUE4QjtRQUN0RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUNyQyxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsR0FBRyxrQkFBSSxDQUFDO1FBRW5GLHdGQUF3RjtRQUN4RixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FDeEMsSUFBSSxFQUNKLGlCQUFpQixFQUNqQixtQkFBbUIsQ0FDcEIsQ0FBQztRQUVGLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3JELE9BQU8sRUFBRSxXQUFXO1lBQ3BCLElBQUksRUFBRSxDQUFDO29CQUNMLEdBQUcsRUFBRSxXQUFXO29CQUNoQixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7aUJBQ3RCLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCwrQkFBK0I7UUFDL0IsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUN4RSxZQUFZLEVBQUUsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQztZQUNuRCxZQUFZLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRTtZQUNsRCxRQUFRLEVBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7WUFDbEMsYUFBYSxFQUFFLGFBQWE7WUFDNUIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsa0JBQWtCO1NBQ3hELENBQUMsQ0FBQztRQUVILDRDQUE0QztRQUM1QyxNQUFNLGdCQUFnQixHQUFHLElBQUksV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDckUsR0FBRztZQUNILGNBQWMsRUFBRSxjQUFjO1lBQzlCLFlBQVksRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRTtTQUN2RCxDQUFDLENBQUM7UUFFSCx3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNwRCxHQUFHO1lBQ0gsV0FBVyxFQUFFLGNBQWM7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsK0RBQStEO1FBQy9ELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ2hGLGdCQUFnQjtZQUNoQixvQkFBb0IsRUFBRSxJQUFJO1lBQzFCLG9CQUFvQixFQUFFLHFCQUFxQjtZQUMzQyxrQ0FBa0MsRUFBRSxLQUFLO1NBQzFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBQ0Y7QUEzREQsZ0RBMkRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcclxuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xyXG5pbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXV0b3NjYWxpbmcnO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcblxyXG5pbXBvcnQgY29uZiBmcm9tICcuLi9jb25maWcvYXBwLmNvbmYnO1xyXG5cclxuaW50ZXJmYWNlIEVjc0NsdXN0ZXJDZGtTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xyXG4gIHZwYzogZWMyLlZwYztcclxuICBzZWN1cml0eUdyb3VwOiBlYzIuU2VjdXJpdHlHcm91cDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEVjc0NsdXN0ZXJDZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBlY3NDbHVzdGVyOiBlY3MuQ2x1c3RlcjtcclxuXHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEVjc0NsdXN0ZXJDZGtTdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICBjb25zdCB7IHZwYywgc2VjdXJpdHlHcm91cCB9ID0gcHJvcHM7XHJcbiAgICBjb25zdCB7IGVjMkluc3RhbmNlUm9sZU5hbWUsIGVjc0NsdXN0ZXJOYW1lLCBlYzJJbnN0YW5jZVR5cGUsIGtleVBhaXJOYW1lIH0gPSBjb25mO1xyXG4gICAgXHJcbiAgICAvLyBpbXBvcnQgRUNTIGNvbnRhaW5lciBpbnN0YW5jZSBJQU0gcm9sZSAod29ya2Fyb3VuZCBkZXBlbmRlbmN5IGN5Y2xpYyByZWZlcmVuY2UgaXNzdWUpXHJcbiAgICBjb25zdCBpbnN0YW5jZVJvbGUgPSBpYW0uUm9sZS5mcm9tUm9sZU5hbWUoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgICdFYzJJbnN0YW5jZVJvbGUnLFxyXG4gICAgICBlYzJJbnN0YW5jZVJvbGVOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGtleVBhaXIgPSBuZXcgZWMyLkNmbktleVBhaXIodGhpcywgJ0NmbktleVBhaXInLCB7XHJcbiAgICAgIGtleU5hbWU6IGtleVBhaXJOYW1lLFxyXG4gICAgICB0YWdzOiBbe1xyXG4gICAgICAgIGtleTogJ1N0YWNrTmFtZScsXHJcbiAgICAgICAgdmFsdWU6IHRoaXMuc3RhY2tOYW1lLFxyXG4gICAgICB9XSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIEVDMiBsYXVuY2ggdGVtcGxhdGVcclxuICAgIGNvbnN0IGxhdW5jaFRlbXBsYXRlID0gbmV3IGVjMi5MYXVuY2hUZW1wbGF0ZSh0aGlzLCAnQVNHLUxhdW5jaFRlbXBsYXRlJywge1xyXG4gICAgICBpbnN0YW5jZVR5cGU6IG5ldyBlYzIuSW5zdGFuY2VUeXBlKGVjMkluc3RhbmNlVHlwZSksXHJcbiAgICAgIG1hY2hpbmVJbWFnZTogZWNzLkVjc09wdGltaXplZEltYWdlLmFtYXpvbkxpbnV4MigpLFxyXG4gICAgICB1c2VyRGF0YTogIGVjMi5Vc2VyRGF0YS5mb3JMaW51eCgpLFxyXG4gICAgICBzZWN1cml0eUdyb3VwOiBzZWN1cml0eUdyb3VwLFxyXG4gICAgICByb2xlOiBpbnN0YW5jZVJvbGUsXHJcbiAgICAgIGtleU5hbWU6IGtleVBhaXIua2V5TmFtZSxcclxuICAgICAgbGF1bmNoVGVtcGxhdGVOYW1lOiB0aGlzLnN0YWNrTmFtZSArICctbGF1bmNoLXRlbXBsYXRlJ1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgICAvLyBjcmVhdGUgYXV0byBzY2FsaW5nIGdyb3VwIGZvciBFQ1MgY2x1c3RlclxyXG4gICAgY29uc3QgYXV0b1NjYWxpbmdHcm91cCA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKHRoaXMsICdBU0cnLCB7XHJcbiAgICAgIHZwYyxcclxuICAgICAgbGF1bmNoVGVtcGxhdGU6IGxhdW5jaFRlbXBsYXRlLFxyXG4gICAgICB1cGRhdGVQb2xpY3k6IGF1dG9zY2FsaW5nLlVwZGF0ZVBvbGljeS5yb2xsaW5nVXBkYXRlKClcclxuICAgIH0pOyBcclxuXHJcbiAgICAvLyBjcmVhdGUgYW4gRUNTIGNsdXN0ZXJcclxuICAgIHRoaXMuZWNzQ2x1c3RlciA9IG5ldyBlY3MuQ2x1c3Rlcih0aGlzLCAnRUNTQ2x1c3RlcicsIHtcclxuICAgICAgdnBjLFxyXG4gICAgICBjbHVzdGVyTmFtZTogZWNzQ2x1c3Rlck5hbWUsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSBjYXBhY2l0eSBwcm92aWRlciBhbmQgYXNzb2NpYXRlIGl0IHdpdGggRUNTIGNsdXN0ZXJcclxuICAgIGNvbnN0IGNhcGFjaXR5UHJvdmlkZXIgPSBuZXcgZWNzLkFzZ0NhcGFjaXR5UHJvdmlkZXIodGhpcywgJ0FzZ0NhcGFjaXR5UHJvdmlkZXInLCB7XHJcbiAgICAgIGF1dG9TY2FsaW5nR3JvdXAsXHJcbiAgICAgIGVuYWJsZU1hbmFnZWRTY2FsaW5nOiB0cnVlLFxyXG4gICAgICBjYXBhY2l0eVByb3ZpZGVyTmFtZTogJ0FzZ0NhcGFjaXR5UHJvdmlkZXInLFxyXG4gICAgICBlbmFibGVNYW5hZ2VkVGVybWluYXRpb25Qcm90ZWN0aW9uOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuZWNzQ2x1c3Rlci5hZGRBc2dDYXBhY2l0eVByb3ZpZGVyKGNhcGFjaXR5UHJvdmlkZXIpO1xyXG4gIH1cclxufSJdfQ==