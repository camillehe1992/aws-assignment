"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdsCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const rds = require("aws-cdk-lib/aws-rds");
const ec2 = require("aws-cdk-lib/aws-ec2");
const resource_initializer_1 = require("../lib/resource-initializer");
const cwlogs = require("aws-cdk-lib/aws-logs");
const lambda = require("aws-cdk-lib/aws-lambda");
class RdsCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { vpc, backendSG, dbSG } = props;
        const credentials = rds.Credentials.fromGeneratedSecret('clusteradmin');
        // create the rds cluster with 2 instances (1 reader and 1 writer)
        this.dbCluster = new rds.DatabaseCluster(this, 'DatabaseCluster', {
            engine: rds.DatabaseClusterEngine.auroraMysql({
                version: rds.AuroraMysqlEngineVersion.VER_3_02_0
            }),
            // Optional - will default to 'admin' username and generated password
            credentials,
            clusterIdentifier: 'mysql',
            instanceProps: {
                // optional , defaults to t3.medium (wiil incur charge)
                instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
                vpcSubnets: {
                    subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
                },
                vpc,
                securityGroups: [dbSG]
            },
        });
        const initializer = new resource_initializer_1.CdkResourceInitializer(this, 'MyRdsInit', {
            config: {
                credsSecretName: credentials.secretName
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
        initializer.customResource.node.addDependency(this.dbCluster);
    }
}
exports.RdsCdkStack = RdsCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmRzLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJkcy1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQywyQ0FBMkM7QUFFM0Msc0VBQXFFO0FBQ3JFLCtDQUErQztBQUMvQyxpREFBaUQ7QUFTakQsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFdkMsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV4RSxrRUFBa0U7UUFDbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ2hFLE1BQU0sRUFBRSxHQUFHLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDO2dCQUM1QyxPQUFPLEVBQUUsR0FBRyxDQUFDLHdCQUF3QixDQUFDLFVBQVU7YUFDakQsQ0FBQztZQUNGLHFFQUFxRTtZQUNyRSxXQUFXO1lBQ1gsaUJBQWlCLEVBQUUsT0FBTztZQUMxQixhQUFhLEVBQUU7Z0JBQ2IsdURBQXVEO2dCQUN2RCxZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQy9CLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUNwQixHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDMUIsVUFBVSxFQUFFO29CQUNWLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFnQjtpQkFDNUM7Z0JBQ0QsR0FBRztnQkFDSCxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUM7YUFDdkI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsR0FBRyxJQUFJLDZDQUFzQixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDaEUsTUFBTSxFQUFFO2dCQUNOLGVBQWUsRUFBRSxXQUFXLENBQUMsVUFBVTthQUN4QztZQUNELGNBQWMsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVM7WUFDOUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxtQkFBbUIsRUFBRSxFQUFFLENBQUM7WUFDbEUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsQyxnQkFBZ0IsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUM3QixHQUFHO1lBQ0gsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQztnQkFDbEMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCO2FBQzVDLENBQUM7U0FDSCxDQUFDLENBQUE7UUFDRiw4QkFBOEI7UUFDOUIsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDO0NBQ0Y7QUFoREQsa0NBZ0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0ICogYXMgcmRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yZHMnO1xyXG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgeyBDZGtSZXNvdXJjZUluaXRpYWxpemVyIH0gZnJvbSAnLi4vbGliL3Jlc291cmNlLWluaXRpYWxpemVyJztcclxuaW1wb3J0ICogYXMgY3dsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xyXG5cclxuXHJcbmludGVyZmFjZSBSZHNDZGtTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xyXG4gIHZwYzogZWMyLlZwYztcclxuICBiYWNrZW5kU0c6IGVjMi5TZWN1cml0eUdyb3VwLFxyXG4gIGRiU0c6IGVjMi5TZWN1cml0eUdyb3VwO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUmRzQ2RrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIFxyXG4gIHB1YmxpYyByZWFkb25seSBkYkNsdXN0ZXI6IHJkcy5EYXRhYmFzZUNsdXN0ZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBSZHNDZGtTdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICBjb25zdCB7IHZwYywgYmFja2VuZFNHLCBkYlNHIH0gPSBwcm9wcztcclxuXHJcbiAgICBjb25zdCBjcmVkZW50aWFscyA9IHJkcy5DcmVkZW50aWFscy5mcm9tR2VuZXJhdGVkU2VjcmV0KCdjbHVzdGVyYWRtaW4nKTtcclxuICAgIFxyXG4gICAgLy8gY3JlYXRlIHRoZSByZHMgY2x1c3RlciB3aXRoIDIgaW5zdGFuY2VzICgxIHJlYWRlciBhbmQgMSB3cml0ZXIpXHJcbiAgICB0aGlzLmRiQ2x1c3RlciA9IG5ldyByZHMuRGF0YWJhc2VDbHVzdGVyKHRoaXMsICdEYXRhYmFzZUNsdXN0ZXInLCB7XHJcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7IFxyXG4gICAgICAgIHZlcnNpb246IHJkcy5BdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24uVkVSXzNfMDJfMFxyXG4gICAgICB9KSxcclxuICAgICAgLy8gT3B0aW9uYWwgLSB3aWxsIGRlZmF1bHQgdG8gJ2FkbWluJyB1c2VybmFtZSBhbmQgZ2VuZXJhdGVkIHBhc3N3b3JkXHJcbiAgICAgIGNyZWRlbnRpYWxzLFxyXG4gICAgICBjbHVzdGVySWRlbnRpZmllcjogJ215c3FsJyxcclxuICAgICAgaW5zdGFuY2VQcm9wczoge1xyXG4gICAgICAgIC8vIG9wdGlvbmFsICwgZGVmYXVsdHMgdG8gdDMubWVkaXVtICh3aWlsIGluY3VyIGNoYXJnZSlcclxuICAgICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXHJcbiAgICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMyxcclxuICAgICAgICAgIGVjMi5JbnN0YW5jZVNpemUuTUVESVVNKSxcclxuICAgICAgICB2cGNTdWJuZXRzOiB7XHJcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfTkFULFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdnBjLFxyXG4gICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbZGJTR11cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGluaXRpYWxpemVyID0gbmV3IENka1Jlc291cmNlSW5pdGlhbGl6ZXIodGhpcywgJ015UmRzSW5pdCcsIHtcclxuICAgICAgY29uZmlnOiB7XHJcbiAgICAgICAgY3JlZHNTZWNyZXROYW1lOiBjcmVkZW50aWFscy5zZWNyZXROYW1lXHJcbiAgICAgIH0sXHJcbiAgICAgIGZuTG9nUmV0ZW50aW9uOiBjd2xvZ3MuUmV0ZW50aW9uRGF5cy5UV09fV0VFS1MsXHJcbiAgICAgIGZuQ29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGAke19fZGlybmFtZX0vcmRzLWluaXQtZm4tY29kZWAsIHt9KSxcclxuICAgICAgZm5UaW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygyKSxcclxuICAgICAgZm5TZWN1cml0eUdyb3VwczogW2JhY2tlbmRTR10sXHJcbiAgICAgIHZwYyxcclxuICAgICAgc3VibmV0c1NlbGVjdGlvbjogdnBjLnNlbGVjdFN1Ym5ldHMoe1xyXG4gICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9OQVRcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgICAvLyBtYW5hZ2UgcmVzb3VyY2VzIGRlcGVuZGVuY3lcclxuICAgIGluaXRpYWxpemVyLmN1c3RvbVJlc291cmNlLm5vZGUuYWRkRGVwZW5kZW5jeSh0aGlzLmRiQ2x1c3Rlcik7XHJcbiAgfVxyXG59XHJcbiJdfQ==