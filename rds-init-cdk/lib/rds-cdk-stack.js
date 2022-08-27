"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdsCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const rds = require("aws-cdk-lib/aws-rds");
const ec2 = require("aws-cdk-lib/aws-ec2");
const cwlogs = require("aws-cdk-lib/aws-logs");
const lambda = require("aws-cdk-lib/aws-lambda");
const resource_initializer_1 = require("../lib/resource-initializer");
const app_conf_1 = require("../config/app.conf");
class RdsCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { vpc, backendSG, dbSG } = props;
        const { instanceIdentifier } = app_conf_1.default;
        const credsSecretName = `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase();
        const credentials = new rds.DatabaseSecret(this, 'MysqlRdsCredentials', {
            secretName: credsSecretName,
            username: 'clusteradmin'
        });
        this.dbInstance = new rds.DatabaseInstance(this, "MysqlInstance", {
            engine: rds.DatabaseInstanceEngine.MYSQL,
            credentials: rds.Credentials.fromSecret(credentials),
            vpc,
            instanceIdentifier,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmRzLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJkcy1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsK0NBQStDO0FBQy9DLGlEQUFpRDtBQUVqRCxzRUFBMEU7QUFDMUUsaURBQXNDO0FBUXRDLE1BQWEsV0FBWSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBSXhDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBdUI7UUFDL0QsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ3ZDLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxHQUFHLGtCQUFJLENBQUM7UUFFcEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxFQUFFLGNBQWMsa0JBQWtCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUM5RSxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ3RFLFVBQVUsRUFBRSxlQUFlO1lBQzNCLFFBQVEsRUFBRSxjQUFjO1NBQ3pCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNoRSxNQUFNLEVBQUUsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEtBQUs7WUFDeEMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUNwRCxHQUFHO1lBQ0gsa0JBQWtCO1lBQ2xCLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FDL0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQ3BCLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUNyQjtZQUNILFVBQVUsRUFBRTtnQkFDVixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7YUFDNUM7WUFDRCxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUM7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxXQUFXLEdBQUcsSUFBSSxrREFBMkIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ3JFLE1BQU0sRUFBRTtnQkFDTixlQUFlLEVBQUUsZUFBZTthQUNqQztZQUNELGNBQWMsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVM7WUFDOUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxtQkFBbUIsRUFBRSxFQUFFLENBQUM7WUFDbEUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsQyxnQkFBZ0IsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUM3QixHQUFHO1lBQ0gsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQztnQkFDbEMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCO2FBQzVDLENBQUM7U0FDSCxDQUFDLENBQUE7UUFDRiw4QkFBOEI7UUFDOUIsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRSxDQUFDO0NBQ0Y7QUEvQ0Qsa0NBK0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0ICogYXMgcmRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yZHMnO1xyXG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XHJcbmltcG9ydCAqIGFzIGN3bG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCB7IFJlc291cmNlSW5pdGlhbGl6ZXJDZGtTdGFjayB9IGZyb20gJy4uL2xpYi9yZXNvdXJjZS1pbml0aWFsaXplcic7XHJcbmltcG9ydCBjb25mIGZyb20gJy4uL2NvbmZpZy9hcHAuY29uZic7XHJcblxyXG5pbnRlcmZhY2UgUmRzQ2RrU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcclxuICB2cGM6IGVjMi5WcGM7XHJcbiAgYmFja2VuZFNHOiBlYzIuU2VjdXJpdHlHcm91cCxcclxuICBkYlNHOiBlYzIuU2VjdXJpdHlHcm91cDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFJkc0Nka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBcclxuICBwdWJsaWMgcmVhZG9ubHkgZGJJbnN0YW5jZTogcmRzLkRhdGFiYXNlSW5zdGFuY2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBSZHNDZGtTdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICBjb25zdCB7IHZwYywgYmFja2VuZFNHLCBkYlNHIH0gPSBwcm9wcztcclxuICAgIGNvbnN0IHsgaW5zdGFuY2VJZGVudGlmaWVyIH0gPSBjb25mO1xyXG5cclxuICAgIGNvbnN0IGNyZWRzU2VjcmV0TmFtZSA9IGAvJHtpZH0vcmRzL2NyZWRzLyR7aW5zdGFuY2VJZGVudGlmaWVyfWAudG9Mb3dlckNhc2UoKVxyXG4gICAgY29uc3QgY3JlZGVudGlhbHMgPSBuZXcgcmRzLkRhdGFiYXNlU2VjcmV0KHRoaXMsICdNeXNxbFJkc0NyZWRlbnRpYWxzJywge1xyXG4gICAgICBzZWNyZXROYW1lOiBjcmVkc1NlY3JldE5hbWUsXHJcbiAgICAgIHVzZXJuYW1lOiAnY2x1c3RlcmFkbWluJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5kYkluc3RhbmNlID0gbmV3IHJkcy5EYXRhYmFzZUluc3RhbmNlKHRoaXMsIFwiTXlzcWxJbnN0YW5jZVwiLCB7XHJcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlSW5zdGFuY2VFbmdpbmUuTVlTUUwsXHJcbiAgICAgIGNyZWRlbnRpYWxzOiByZHMuQ3JlZGVudGlhbHMuZnJvbVNlY3JldChjcmVkZW50aWFscyksXHJcbiAgICAgIHZwYyxcclxuICAgICAgaW5zdGFuY2VJZGVudGlmaWVyLFxyXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXHJcbiAgICAgICAgZWMyLkluc3RhbmNlQ2xhc3MuVDIsXHJcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xyXG4gICAgICAgICksXHJcbiAgICAgIHZwY1N1Ym5ldHM6IHtcclxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfTkFULFxyXG4gICAgICB9LFxyXG4gICAgICBzZWN1cml0eUdyb3VwczogW2RiU0ddXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsaXplciA9IG5ldyBSZXNvdXJjZUluaXRpYWxpemVyQ2RrU3RhY2sodGhpcywgJ015UmRzSW5pdCcsIHtcclxuICAgICAgY29uZmlnOiB7XHJcbiAgICAgICAgY3JlZHNTZWNyZXROYW1lOiBjcmVkc1NlY3JldE5hbWVcclxuICAgICAgfSxcclxuICAgICAgZm5Mb2dSZXRlbnRpb246IGN3bG9ncy5SZXRlbnRpb25EYXlzLlRXT19XRUVLUyxcclxuICAgICAgZm5Db2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoYCR7X19kaXJuYW1lfS9yZHMtaW5pdC1mbi1jb2RlYCwge30pLFxyXG4gICAgICBmblRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDIpLFxyXG4gICAgICBmblNlY3VyaXR5R3JvdXBzOiBbYmFja2VuZFNHXSxcclxuICAgICAgdnBjLFxyXG4gICAgICBzdWJuZXRzU2VsZWN0aW9uOiB2cGMuc2VsZWN0U3VibmV0cyh7XHJcbiAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX05BVFxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICAgIC8vIG1hbmFnZSByZXNvdXJjZXMgZGVwZW5kZW5jeVxyXG4gICAgaW5pdGlhbGl6ZXIuY3VzdG9tUmVzb3VyY2Uubm9kZS5hZGREZXBlbmRlbmN5KHRoaXMuZGJJbnN0YW5jZSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==