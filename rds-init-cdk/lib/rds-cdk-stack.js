"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdsCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const rds = require("aws-cdk-lib/aws-rds");
const ec2 = require("aws-cdk-lib/aws-ec2");
const cwlogs = require("aws-cdk-lib/aws-logs");
const lambda = require("aws-cdk-lib/aws-lambda");
const resource_initializer_1 = require("../lib/resource-initializer");
class RdsCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { vpc, backendSG, dbSG } = props;
        const instanceIdentifier = 'mysql-01';
        const credsSecretName = `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase();
        const credentials = new rds.DatabaseSecret(this, 'MysqlRdsCredentials', {
            secretName: credsSecretName,
            username: 'clusteradmin'
        });
        // const credentials = rds.Credentials.fromGeneratedSecret('clusteradmin');
        this.dbInstance = new rds.DatabaseInstance(this, "MysqlInstance", {
            engine: rds.DatabaseInstanceEngine.MYSQL,
            credentials: rds.Credentials.fromSecret(credentials),
            vpc,
            instanceIdentifier: 'mysql-instance',
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
            },
            securityGroups: [dbSG]
        });
        const initializer = new resource_initializer_1.ResourceInitializerCdkStack(this, 'MyRdsInit', {
            config: {
                credsSecretName: credsSecretName
            },
            fnLogRetention: cwlogs.RetentionDays.TWO_WEEKS,
            fnCode: lambda.Code.fromAsset(`${__dirname}/rds-init-fn-code`, {}),
            fnTimeout: cdk.Duration.minutes(2),
            fnSecurityGroups: [backendSG],
            vpc,
            subnetsSelection: vpc.selectSubnets({
                subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
            })
        });
        // manage resources dependency
        initializer.customResource.node.addDependency(this.dbInstance);
    }
}
exports.RdsCdkStack = RdsCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmRzLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJkcy1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsK0NBQStDO0FBQy9DLGlEQUFpRDtBQUVqRCxzRUFBMEU7QUFRMUUsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFdkMsTUFBTSxrQkFBa0IsR0FBRyxVQUFVLENBQUM7UUFDdEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxFQUFFLGNBQWMsa0JBQWtCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUM5RSxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ3RFLFVBQVUsRUFBRSxlQUFlO1lBQzNCLFFBQVEsRUFBRSxjQUFjO1NBQ3pCLENBQUMsQ0FBQztRQUVILDJFQUEyRTtRQUUzRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDaEUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLO1lBQ3hDLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7WUFDcEQsR0FBRztZQUNILGtCQUFrQixFQUFFLGdCQUFnQjtZQUNwQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQy9CLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNwQixHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FDckI7WUFDSCxVQUFVLEVBQUU7Z0JBQ1YsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCO2FBQzVDO1lBQ0QsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDO1NBQ3ZCLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLElBQUksa0RBQTJCLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUNyRSxNQUFNLEVBQUU7Z0JBQ04sZUFBZSxFQUFFLGVBQWU7YUFDakM7WUFDRCxjQUFjLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTO1lBQzlDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDO1lBQ2xFLFNBQVMsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbEMsZ0JBQWdCLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDN0IsR0FBRztZQUNILGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUM7Z0JBQ2xDLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFnQjthQUM1QyxDQUFDO1NBQ0gsQ0FBQyxDQUFBO1FBQ0YsOEJBQThCO1FBQzlCLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUNGO0FBakRELGtDQWlEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCAqIGFzIHJkcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJztcclxuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xyXG5pbXBvcnQgKiBhcyBjd2xvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgeyBSZXNvdXJjZUluaXRpYWxpemVyQ2RrU3RhY2sgfSBmcm9tICcuLi9saWIvcmVzb3VyY2UtaW5pdGlhbGl6ZXInO1xyXG5cclxuaW50ZXJmYWNlIFJkc0Nka1N0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XHJcbiAgdnBjOiBlYzIuVnBjO1xyXG4gIGJhY2tlbmRTRzogZWMyLlNlY3VyaXR5R3JvdXAsXHJcbiAgZGJTRzogZWMyLlNlY3VyaXR5R3JvdXA7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBSZHNDZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgXHJcbiAgcHVibGljIHJlYWRvbmx5IGRiSW5zdGFuY2U6IHJkcy5EYXRhYmFzZUluc3RhbmNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogUmRzQ2RrU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgY29uc3QgeyB2cGMsIGJhY2tlbmRTRywgZGJTRyB9ID0gcHJvcHM7XHJcblxyXG4gICAgY29uc3QgaW5zdGFuY2VJZGVudGlmaWVyID0gJ215c3FsLTAxJztcclxuICAgIGNvbnN0IGNyZWRzU2VjcmV0TmFtZSA9IGAvJHtpZH0vcmRzL2NyZWRzLyR7aW5zdGFuY2VJZGVudGlmaWVyfWAudG9Mb3dlckNhc2UoKVxyXG4gICAgY29uc3QgY3JlZGVudGlhbHMgPSBuZXcgcmRzLkRhdGFiYXNlU2VjcmV0KHRoaXMsICdNeXNxbFJkc0NyZWRlbnRpYWxzJywge1xyXG4gICAgICBzZWNyZXROYW1lOiBjcmVkc1NlY3JldE5hbWUsXHJcbiAgICAgIHVzZXJuYW1lOiAnY2x1c3RlcmFkbWluJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gY29uc3QgY3JlZGVudGlhbHMgPSByZHMuQ3JlZGVudGlhbHMuZnJvbUdlbmVyYXRlZFNlY3JldCgnY2x1c3RlcmFkbWluJyk7XHJcblxyXG4gICAgdGhpcy5kYkluc3RhbmNlID0gbmV3IHJkcy5EYXRhYmFzZUluc3RhbmNlKHRoaXMsIFwiTXlzcWxJbnN0YW5jZVwiLCB7XHJcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlSW5zdGFuY2VFbmdpbmUuTVlTUUwsXHJcbiAgICAgIGNyZWRlbnRpYWxzOiByZHMuQ3JlZGVudGlhbHMuZnJvbVNlY3JldChjcmVkZW50aWFscyksXHJcbiAgICAgIHZwYyxcclxuICAgICAgaW5zdGFuY2VJZGVudGlmaWVyOiAnbXlzcWwtaW5zdGFuY2UnLFxyXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXHJcbiAgICAgICAgZWMyLkluc3RhbmNlQ2xhc3MuVDIsXHJcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xyXG4gICAgICAgICksXHJcbiAgICAgIHZwY1N1Ym5ldHM6IHtcclxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfTkFULFxyXG4gICAgICB9LFxyXG4gICAgICBzZWN1cml0eUdyb3VwczogW2RiU0ddXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsaXplciA9IG5ldyBSZXNvdXJjZUluaXRpYWxpemVyQ2RrU3RhY2sodGhpcywgJ015UmRzSW5pdCcsIHtcclxuICAgICAgY29uZmlnOiB7XHJcbiAgICAgICAgY3JlZHNTZWNyZXROYW1lOiBjcmVkc1NlY3JldE5hbWVcclxuICAgICAgfSxcclxuICAgICAgZm5Mb2dSZXRlbnRpb246IGN3bG9ncy5SZXRlbnRpb25EYXlzLlRXT19XRUVLUyxcclxuICAgICAgZm5Db2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoYCR7X19kaXJuYW1lfS9yZHMtaW5pdC1mbi1jb2RlYCwge30pLFxyXG4gICAgICBmblRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDIpLFxyXG4gICAgICBmblNlY3VyaXR5R3JvdXBzOiBbYmFja2VuZFNHXSxcclxuICAgICAgdnBjLFxyXG4gICAgICBzdWJuZXRzU2VsZWN0aW9uOiB2cGMuc2VsZWN0U3VibmV0cyh7XHJcbiAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX05BVFxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICAgIC8vIG1hbmFnZSByZXNvdXJjZXMgZGVwZW5kZW5jeVxyXG4gICAgaW5pdGlhbGl6ZXIuY3VzdG9tUmVzb3VyY2Uubm9kZS5hZGREZXBlbmRlbmN5KHRoaXMuZGJJbnN0YW5jZSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==