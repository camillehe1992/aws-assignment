"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceInitializerCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const iam = require("aws-cdk-lib/aws-iam");
const constructs_1 = require("constructs");
const custom_resources_1 = require("aws-cdk-lib/custom-resources");
const crypto_1 = require("crypto");
class ResourceInitializerCdkStack extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const stack = cdk.Stack.of(this);
        const fn = new lambda.Function(this, 'ResourceInitializerCdkStackFn', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: props.fnCode,
            memorySize: props.fnMemorySize || 128,
            functionName: `${id}-ResInit${stack.stackName}`,
            vpcSubnets: props.vpc.selectSubnets(props.subnetsSelection),
            vpc: props.vpc,
            securityGroups: props.fnSecurityGroups,
            timeout: props.fnTimeout,
            logRetention: props.fnLogRetention,
            allowAllOutbound: true,
        });
        fn.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'secretsmanager:GetSecretValue'
            ],
            resources: ['*'],
            effect: iam.Effect.ALLOW
        }));
        const payload = JSON.stringify({
            params: {
                config: props.config
            }
        });
        const payloadHashPrefix = crypto_1.createHash('md5').update(payload).digest('hex').substring(0, 6);
        const sdkCall = {
            service: 'Lambda',
            action: 'invoke',
            parameters: {
                FunctionName: fn.functionName,
                Payload: payload
            },
            physicalResourceId: custom_resources_1.PhysicalResourceId.of(`${id}-AwsSdkCall-${fn.currentVersion.version + payloadHashPrefix}`)
        };
        const customResourceFnRole = new iam.Role(this, 'AwsCustomResourceRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
        });
        customResourceFnRole.addToPolicy(new iam.PolicyStatement({
            resources: [`arn:aws:lambda:${stack.region}:${stack.account}:function:*-ResInit${stack.stackName}`],
            actions: ['lambda:InvokeFunction']
        }));
        this.customResource = new custom_resources_1.AwsCustomResource(this, 'AwsCustomResource', {
            policy: custom_resources_1.AwsCustomResourcePolicy.fromSdkCalls({ resources: custom_resources_1.AwsCustomResourcePolicy.ANY_RESOURCE }),
            onUpdate: sdkCall,
            timeout: cdk.Duration.minutes(10),
            role: customResourceFnRole
        });
        this.response = this.customResource.getResponseField('Payload');
        this.function = fn;
    }
}
exports.ResourceInitializerCdkStack = ResourceInitializerCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtaW5pdGlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZXNvdXJjZS1pbml0aWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWdEO0FBRWhELDJDQUEyQztBQUMzQywyQ0FBc0M7QUFDdEMsbUVBQXlIO0FBQ3pILG1DQUFtQztBQWFuQyxNQUFhLDJCQUE0QixTQUFRLHNCQUFTO0lBS3hELFlBQWEsS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBdUM7UUFDaEYsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLCtCQUErQixFQUFFO1lBQ3BFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ2xCLFVBQVUsRUFBRSxLQUFLLENBQUMsWUFBWSxJQUFJLEdBQUc7WUFDckMsWUFBWSxFQUFFLEdBQUcsRUFBRSxXQUFXLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDL0MsVUFBVSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzRCxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDZCxjQUFjLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtZQUN0QyxPQUFPLEVBQUUsS0FBSyxDQUFDLFNBQVM7WUFDeEIsWUFBWSxFQUFFLEtBQUssQ0FBQyxjQUFjO1lBQ2xDLGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLGVBQWUsQ0FDaEIsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3RCLE9BQU8sRUFBRTtnQkFDUCwrQkFBK0I7YUFDaEM7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSztTQUMzQixDQUFDLENBQUMsQ0FBQTtRQUVILE1BQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDckMsTUFBTSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTthQUNyQjtTQUNGLENBQUMsQ0FBQTtRQUVGLE1BQU0saUJBQWlCLEdBQUcsbUJBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFekYsTUFBTSxPQUFPLEdBQWU7WUFDMUIsT0FBTyxFQUFFLFFBQVE7WUFDakIsTUFBTSxFQUFFLFFBQVE7WUFDaEIsVUFBVSxFQUFFO2dCQUNWLFlBQVksRUFBRSxFQUFFLENBQUMsWUFBWTtnQkFDN0IsT0FBTyxFQUFFLE9BQU87YUFDakI7WUFDRCxrQkFBa0IsRUFBRSxxQ0FBa0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztTQUMvRyxDQUFBO1FBRUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ3ZFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztTQUM1RCxDQUFDLENBQUE7UUFDRixvQkFBb0IsQ0FBQyxXQUFXLENBQzlCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixTQUFTLEVBQUUsQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxzQkFBc0IsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25HLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDO1NBQ25DLENBQUMsQ0FDSCxDQUFBO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG9DQUFpQixDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNyRSxNQUFNLEVBQUUsMENBQXVCLENBQUMsWUFBWSxDQUFDLEVBQUUsU0FBUyxFQUFFLDBDQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pHLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsSUFBSSxFQUFFLG9CQUFvQjtTQUMzQixDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDcEIsQ0FBQztDQUNGO0FBdkVELGtFQXVFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJ1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSdcclxuaW1wb3J0ICogYXMgY3dsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcclxuaW1wb3J0ICAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJ1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJ1xyXG5pbXBvcnQgeyBBd3NDdXN0b21SZXNvdXJjZSwgQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3ksIEF3c1Nka0NhbGwsIFBoeXNpY2FsUmVzb3VyY2VJZCB9IGZyb20gJ2F3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMnXHJcbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tICdjcnlwdG8nXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlc291cmNlSW5pdGlhbGl6ZXJDZGtTdGFja1Byb3BzIHtcclxuICB2cGM6IGVjMi5JVnBjXHJcbiAgc3VibmV0c1NlbGVjdGlvbjogZWMyLlN1Ym5ldFNlbGVjdGlvblxyXG4gIGZuU2VjdXJpdHlHcm91cHM6IGVjMi5JU2VjdXJpdHlHcm91cFtdXHJcbiAgZm5UaW1lb3V0OiBjZGsuRHVyYXRpb25cclxuICBmbkNvZGU6IGxhbWJkYS5Db2RlXHJcbiAgZm5Mb2dSZXRlbnRpb246IGN3bG9ncy5SZXRlbnRpb25EYXlzXHJcbiAgZm5NZW1vcnlTaXplPzogbnVtYmVyXHJcbiAgY29uZmlnOiBvYmplY3RcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFJlc291cmNlSW5pdGlhbGl6ZXJDZGtTdGFjayBleHRlbmRzIENvbnN0cnVjdCB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHJlc3BvbnNlOiBzdHJpbmdcclxuICBwdWJsaWMgcmVhZG9ubHkgY3VzdG9tUmVzb3VyY2U6IEF3c0N1c3RvbVJlc291cmNlXHJcbiAgcHVibGljIHJlYWRvbmx5IGZ1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb25cclxuXHJcbiAgY29uc3RydWN0b3IgKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBSZXNvdXJjZUluaXRpYWxpemVyQ2RrU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcclxuXHJcbiAgICBjb25zdCBzdGFjayA9IGNkay5TdGFjay5vZih0aGlzKTtcclxuXHJcbiAgICBjb25zdCBmbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Jlc291cmNlSW5pdGlhbGl6ZXJDZGtTdGFja0ZuJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTZfWCxcclxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBwcm9wcy5mbkNvZGUsXHJcbiAgICAgIG1lbW9yeVNpemU6IHByb3BzLmZuTWVtb3J5U2l6ZSB8fCAxMjgsXHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogYCR7aWR9LVJlc0luaXQke3N0YWNrLnN0YWNrTmFtZX1gLFxyXG4gICAgICB2cGNTdWJuZXRzOiBwcm9wcy52cGMuc2VsZWN0U3VibmV0cyhwcm9wcy5zdWJuZXRzU2VsZWN0aW9uKSxcclxuICAgICAgdnBjOiBwcm9wcy52cGMsXHJcbiAgICAgIHNlY3VyaXR5R3JvdXBzOiBwcm9wcy5mblNlY3VyaXR5R3JvdXBzLFxyXG4gICAgICB0aW1lb3V0OiBwcm9wcy5mblRpbWVvdXQsXHJcbiAgICAgIGxvZ1JldGVudGlvbjogcHJvcHMuZm5Mb2dSZXRlbnRpb24sXHJcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXHJcbiAgICB9KVxyXG5cclxuICAgIGZuLmFkZFRvUm9sZVBvbGljeShcclxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICdzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZSdcclxuICAgICAgICBdLFxyXG4gICAgICAgIHJlc291cmNlczogWycqJ10sXHJcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XXHJcbiAgICB9KSlcclxuXHJcbiAgICBjb25zdCBwYXlsb2FkOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgIHBhcmFtczoge1xyXG4gICAgICAgIGNvbmZpZzogcHJvcHMuY29uZmlnXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgcGF5bG9hZEhhc2hQcmVmaXggPSBjcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUocGF5bG9hZCkuZGlnZXN0KCdoZXgnKS5zdWJzdHJpbmcoMCwgNilcclxuXHJcbiAgICBjb25zdCBzZGtDYWxsOiBBd3NTZGtDYWxsID0ge1xyXG4gICAgICBzZXJ2aWNlOiAnTGFtYmRhJyxcclxuICAgICAgYWN0aW9uOiAnaW52b2tlJyxcclxuICAgICAgcGFyYW1ldGVyczoge1xyXG4gICAgICAgIEZ1bmN0aW9uTmFtZTogZm4uZnVuY3Rpb25OYW1lLFxyXG4gICAgICAgIFBheWxvYWQ6IHBheWxvYWRcclxuICAgICAgfSxcclxuICAgICAgcGh5c2ljYWxSZXNvdXJjZUlkOiBQaHlzaWNhbFJlc291cmNlSWQub2YoYCR7aWR9LUF3c1Nka0NhbGwtJHtmbi5jdXJyZW50VmVyc2lvbi52ZXJzaW9uICsgcGF5bG9hZEhhc2hQcmVmaXh9YClcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgY3VzdG9tUmVzb3VyY2VGblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0F3c0N1c3RvbVJlc291cmNlUm9sZScsIHtcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJylcclxuICAgIH0pXHJcbiAgICBjdXN0b21SZXNvdXJjZUZuUm9sZS5hZGRUb1BvbGljeShcclxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmxhbWJkYToke3N0YWNrLnJlZ2lvbn06JHtzdGFjay5hY2NvdW50fTpmdW5jdGlvbjoqLVJlc0luaXQke3N0YWNrLnN0YWNrTmFtZX1gXSxcclxuICAgICAgICBhY3Rpb25zOiBbJ2xhbWJkYTpJbnZva2VGdW5jdGlvbiddXHJcbiAgICAgIH0pXHJcbiAgICApXHJcbiAgICB0aGlzLmN1c3RvbVJlc291cmNlID0gbmV3IEF3c0N1c3RvbVJlc291cmNlKHRoaXMsICdBd3NDdXN0b21SZXNvdXJjZScsIHtcclxuICAgICAgcG9saWN5OiBBd3NDdXN0b21SZXNvdXJjZVBvbGljeS5mcm9tU2RrQ2FsbHMoeyByZXNvdXJjZXM6IEF3c0N1c3RvbVJlc291cmNlUG9saWN5LkFOWV9SRVNPVVJDRSB9KSxcclxuICAgICAgb25VcGRhdGU6IHNka0NhbGwsXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDEwKSxcclxuICAgICAgcm9sZTogY3VzdG9tUmVzb3VyY2VGblJvbGVcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5yZXNwb25zZSA9IHRoaXMuY3VzdG9tUmVzb3VyY2UuZ2V0UmVzcG9uc2VGaWVsZCgnUGF5bG9hZCcpXHJcblxyXG4gICAgdGhpcy5mdW5jdGlvbiA9IGZuXHJcbiAgfVxyXG59Il19