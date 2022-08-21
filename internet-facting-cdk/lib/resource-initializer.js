"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkResourceInitializer = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const iam = require("aws-cdk-lib/aws-iam");
const constructs_1 = require("constructs");
const custom_resources_1 = require("aws-cdk-lib/custom-resources");
const crypto_1 = require("crypto");
class CdkResourceInitializer extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const stack = cdk.Stack.of(this);
        const fn = new lambda.Function(this, 'ResourceInitializerFn', {
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
exports.CdkResourceInitializer = CdkResourceInitializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtaW5pdGlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZXNvdXJjZS1pbml0aWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWdEO0FBRWhELDJDQUEyQztBQUMzQywyQ0FBc0M7QUFDdEMsbUVBQXlIO0FBQ3pILG1DQUFtQztBQWFuQyxNQUFhLHNCQUF1QixTQUFRLHNCQUFTO0lBS25ELFlBQWEsS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0M7UUFDM0UsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQzVELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ2xCLFVBQVUsRUFBRSxLQUFLLENBQUMsWUFBWSxJQUFJLEdBQUc7WUFDckMsWUFBWSxFQUFFLEdBQUcsRUFBRSxXQUFXLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDL0MsVUFBVSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzRCxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDZCxjQUFjLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtZQUN0QyxPQUFPLEVBQUUsS0FBSyxDQUFDLFNBQVM7WUFDeEIsWUFBWSxFQUFFLEtBQUssQ0FBQyxjQUFjO1lBQ2xDLGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLGVBQWUsQ0FDaEIsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3RCLE9BQU8sRUFBRTtnQkFDUCwrQkFBK0I7YUFDaEM7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSztTQUMzQixDQUFDLENBQUMsQ0FBQTtRQUVILE1BQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDckMsTUFBTSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTthQUNyQjtTQUNGLENBQUMsQ0FBQTtRQUVGLE1BQU0saUJBQWlCLEdBQUcsbUJBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFekYsTUFBTSxPQUFPLEdBQWU7WUFDMUIsT0FBTyxFQUFFLFFBQVE7WUFDakIsTUFBTSxFQUFFLFFBQVE7WUFDaEIsVUFBVSxFQUFFO2dCQUNWLFlBQVksRUFBRSxFQUFFLENBQUMsWUFBWTtnQkFDN0IsT0FBTyxFQUFFLE9BQU87YUFDakI7WUFDRCxrQkFBa0IsRUFBRSxxQ0FBa0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztTQUMvRyxDQUFBO1FBRUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ3ZFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztTQUM1RCxDQUFDLENBQUE7UUFDRixvQkFBb0IsQ0FBQyxXQUFXLENBQzlCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixTQUFTLEVBQUUsQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxzQkFBc0IsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25HLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDO1NBQ25DLENBQUMsQ0FDSCxDQUFBO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG9DQUFpQixDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNyRSxNQUFNLEVBQUUsMENBQXVCLENBQUMsWUFBWSxDQUFDLEVBQUUsU0FBUyxFQUFFLDBDQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pHLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsSUFBSSxFQUFFLG9CQUFvQjtTQUMzQixDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDcEIsQ0FBQztDQUNGO0FBdkVELHdEQXVFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJ1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSdcclxuaW1wb3J0ICogYXMgY3dsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcclxuaW1wb3J0ICAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJ1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJ1xyXG5pbXBvcnQgeyBBd3NDdXN0b21SZXNvdXJjZSwgQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3ksIEF3c1Nka0NhbGwsIFBoeXNpY2FsUmVzb3VyY2VJZCB9IGZyb20gJ2F3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMnXHJcbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tICdjcnlwdG8nXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENka1Jlc291cmNlSW5pdGlhbGl6ZXJQcm9wcyB7XHJcbiAgdnBjOiBlYzIuSVZwY1xyXG4gIHN1Ym5ldHNTZWxlY3Rpb246IGVjMi5TdWJuZXRTZWxlY3Rpb25cclxuICBmblNlY3VyaXR5R3JvdXBzOiBlYzIuSVNlY3VyaXR5R3JvdXBbXVxyXG4gIGZuVGltZW91dDogY2RrLkR1cmF0aW9uXHJcbiAgZm5Db2RlOiBsYW1iZGEuQ29kZVxyXG4gIGZuTG9nUmV0ZW50aW9uOiBjd2xvZ3MuUmV0ZW50aW9uRGF5c1xyXG4gIGZuTWVtb3J5U2l6ZT86IG51bWJlclxyXG4gIGNvbmZpZzogb2JqZWN0XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDZGtSZXNvdXJjZUluaXRpYWxpemVyIGV4dGVuZHMgQ29uc3RydWN0IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgcmVzcG9uc2U6IHN0cmluZ1xyXG4gIHB1YmxpYyByZWFkb25seSBjdXN0b21SZXNvdXJjZTogQXdzQ3VzdG9tUmVzb3VyY2VcclxuICBwdWJsaWMgcmVhZG9ubHkgZnVuY3Rpb246IGxhbWJkYS5GdW5jdGlvblxyXG5cclxuICBjb25zdHJ1Y3RvciAoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IENka1Jlc291cmNlSW5pdGlhbGl6ZXJQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcclxuXHJcbiAgICBjb25zdCBzdGFjayA9IGNkay5TdGFjay5vZih0aGlzKTtcclxuXHJcbiAgICBjb25zdCBmbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Jlc291cmNlSW5pdGlhbGl6ZXJGbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE2X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcclxuICAgICAgY29kZTogcHJvcHMuZm5Db2RlLFxyXG4gICAgICBtZW1vcnlTaXplOiBwcm9wcy5mbk1lbW9yeVNpemUgfHwgMTI4LFxyXG4gICAgICBmdW5jdGlvbk5hbWU6IGAke2lkfS1SZXNJbml0JHtzdGFjay5zdGFja05hbWV9YCxcclxuICAgICAgdnBjU3VibmV0czogcHJvcHMudnBjLnNlbGVjdFN1Ym5ldHMocHJvcHMuc3VibmV0c1NlbGVjdGlvbiksXHJcbiAgICAgIHZwYzogcHJvcHMudnBjLFxyXG4gICAgICBzZWN1cml0eUdyb3VwczogcHJvcHMuZm5TZWN1cml0eUdyb3VwcyxcclxuICAgICAgdGltZW91dDogcHJvcHMuZm5UaW1lb3V0LFxyXG4gICAgICBsb2dSZXRlbnRpb246IHByb3BzLmZuTG9nUmV0ZW50aW9uLFxyXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxyXG4gICAgfSlcclxuXHJcbiAgICBmbi5hZGRUb1JvbGVQb2xpY3koXHJcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAnc2VjcmV0c21hbmFnZXI6R2V0U2VjcmV0VmFsdWUnXHJcbiAgICAgICAgXSxcclxuICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxyXG4gICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPV1xyXG4gICAgfSkpXHJcblxyXG4gICAgY29uc3QgcGF5bG9hZDogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICBwYXJhbXM6IHtcclxuICAgICAgICBjb25maWc6IHByb3BzLmNvbmZpZ1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IHBheWxvYWRIYXNoUHJlZml4ID0gY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKHBheWxvYWQpLmRpZ2VzdCgnaGV4Jykuc3Vic3RyaW5nKDAsIDYpXHJcblxyXG4gICAgY29uc3Qgc2RrQ2FsbDogQXdzU2RrQ2FsbCA9IHtcclxuICAgICAgc2VydmljZTogJ0xhbWJkYScsXHJcbiAgICAgIGFjdGlvbjogJ2ludm9rZScsXHJcbiAgICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgICBGdW5jdGlvbk5hbWU6IGZuLmZ1bmN0aW9uTmFtZSxcclxuICAgICAgICBQYXlsb2FkOiBwYXlsb2FkXHJcbiAgICAgIH0sXHJcbiAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogUGh5c2ljYWxSZXNvdXJjZUlkLm9mKGAke2lkfS1Bd3NTZGtDYWxsLSR7Zm4uY3VycmVudFZlcnNpb24udmVyc2lvbiArIHBheWxvYWRIYXNoUHJlZml4fWApXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IGN1c3RvbVJlc291cmNlRm5Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdBd3NDdXN0b21SZXNvdXJjZVJvbGUnLCB7XHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpXHJcbiAgICB9KVxyXG4gICAgY3VzdG9tUmVzb3VyY2VGblJvbGUuYWRkVG9Qb2xpY3koXHJcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgICByZXNvdXJjZXM6IFtgYXJuOmF3czpsYW1iZGE6JHtzdGFjay5yZWdpb259OiR7c3RhY2suYWNjb3VudH06ZnVuY3Rpb246Ki1SZXNJbml0JHtzdGFjay5zdGFja05hbWV9YF0sXHJcbiAgICAgICAgYWN0aW9uczogWydsYW1iZGE6SW52b2tlRnVuY3Rpb24nXVxyXG4gICAgICB9KVxyXG4gICAgKVxyXG4gICAgdGhpcy5jdXN0b21SZXNvdXJjZSA9IG5ldyBBd3NDdXN0b21SZXNvdXJjZSh0aGlzLCAnQXdzQ3VzdG9tUmVzb3VyY2UnLCB7XHJcbiAgICAgIHBvbGljeTogQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuZnJvbVNka0NhbGxzKHsgcmVzb3VyY2VzOiBBd3NDdXN0b21SZXNvdXJjZVBvbGljeS5BTllfUkVTT1VSQ0UgfSksXHJcbiAgICAgIG9uVXBkYXRlOiBzZGtDYWxsLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygxMCksXHJcbiAgICAgIHJvbGU6IGN1c3RvbVJlc291cmNlRm5Sb2xlXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMucmVzcG9uc2UgPSB0aGlzLmN1c3RvbVJlc291cmNlLmdldFJlc3BvbnNlRmllbGQoJ1BheWxvYWQnKVxyXG5cclxuICAgIHRoaXMuZnVuY3Rpb24gPSBmblxyXG4gIH1cclxufSJdfQ==