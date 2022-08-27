"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VpcCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
class VpcCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // create the VPC and other necessary network resources
        this.vpc = new ec2.Vpc(this, 'MainVpc', {
            cidr: '10.0.0.0/16',
            natGateways: 1,
            natGatewaySubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },
            maxAzs: 2,
            vpcName: 'MainVpc',
            gatewayEndpoints: {
                S3: {
                    service: ec2.GatewayVpcEndpointAwsService.S3,
                }
            },
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 28,
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
                }
            ],
        });
        // create a security group for a web server tier
        this.webserverSG = new ec2.SecurityGroup(this, 'WebServerSecurityGroup', {
            vpc: this.vpc,
            allowAllOutbound: true,
            securityGroupName: 'web-server-sg',
            description: 'security group for a web server',
        });
        this.webserverSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow SSH access from anywhere');
        this.webserverSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow HTTP traffic from anywhere on port 80');
        // create a security group for a backend server tier
        this.backendServerSG = new ec2.SecurityGroup(this, 'BackendServerSecurityGroup', {
            vpc: this.vpc,
            allowAllOutbound: true,
            securityGroupName: 'backend-server-sg',
            description: 'security group for a backend server',
        });
        this.backendServerSG.connections.allowFrom(new ec2.Connections({
            securityGroups: [this.webserverSG],
        }), ec2.Port.allTraffic(), 'allow all traffic from the webserver security group');
        // create a security group for a database server tier
        this.dbserverSG = new ec2.SecurityGroup(this, 'DatabaseServerSecurityGroup', {
            vpc: this.vpc,
            allowAllOutbound: true,
            securityGroupName: 'database-server-sg',
            description: 'security group for a database server',
        });
        this.dbserverSG.connections.allowFrom(new ec2.Connections({
            securityGroups: [this.backendServerSG],
        }), ec2.Port.tcp(3306), 'allow traffic on port 3306 from the backend server security group');
    }
}
exports.VpcCdkStack = VpcCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBjLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZwYy1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLDJDQUEyQztBQUUzQyxNQUFhLFdBQVksU0FBUSxHQUFHLENBQUMsS0FBSztJQU94QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ3RDLElBQUksRUFBRSxhQUFhO1lBQ25CLFdBQVcsRUFBRSxDQUFDO1lBQ2QsaUJBQWlCLEVBQUU7Z0JBQ2pCLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07YUFDbEM7WUFDRCxNQUFNLEVBQUUsQ0FBQztZQUNULE9BQU8sRUFBRSxTQUFTO1lBQ2xCLGdCQUFnQixFQUFFO2dCQUNoQixFQUFFLEVBQUU7b0JBQ0YsT0FBTyxFQUFFLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFO2lCQUM3QzthQUNGO1lBQ0QsbUJBQW1CLEVBQUU7Z0JBQ25CO29CQUNFLFFBQVEsRUFBRSxFQUFFO29CQUNaLElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07aUJBQ2xDO2dCQUNEO29CQUNFLFFBQVEsRUFBRSxFQUFFO29CQUNaLElBQUksRUFBRSxTQUFTO29CQUNmLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFnQjtpQkFDNUM7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILGdEQUFnRDtRQUNoRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDdkUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixpQkFBaUIsRUFBRSxlQUFlO1lBQ2xDLFdBQVcsRUFBRSxpQ0FBaUM7U0FDL0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUNoQixnQ0FBZ0MsQ0FDakMsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFDaEIsNkNBQTZDLENBQzlDLENBQUM7UUFFRixvREFBb0Q7UUFDcEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQy9FLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsaUJBQWlCLEVBQUUsbUJBQW1CO1lBQ3RDLFdBQVcsRUFBRSxxQ0FBcUM7U0FDbkQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUN4QyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUM7WUFDbEIsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUNuQyxDQUFDLEVBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFDckIscURBQXFELENBQ3RELENBQUM7UUFFRixxREFBcUQ7UUFDckQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFO1lBQzNFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsaUJBQWlCLEVBQUUsb0JBQW9CO1lBQ3ZDLFdBQVcsRUFBRSxzQ0FBc0M7U0FDcEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUNuQyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUM7WUFDbEIsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUN2QyxDQUFDLEVBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQ2xCLG1FQUFtRSxDQUNwRSxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBMUZELGtDQTBGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcblxuZXhwb3J0IGNsYXNzIFZwY0Nka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgXG4gIHB1YmxpYyByZWFkb25seSB2cGM6IGVjMi5WcGM7XG4gIHB1YmxpYyByZWFkb25seSB3ZWJzZXJ2ZXJTRzogZWMyLlNlY3VyaXR5R3JvdXA7XG4gIHB1YmxpYyByZWFkb25seSBiYWNrZW5kU2VydmVyU0c6IGVjMi5TZWN1cml0eUdyb3VwO1xuICBwdWJsaWMgcmVhZG9ubHkgZGJzZXJ2ZXJTRzogZWMyLlNlY3VyaXR5R3JvdXA7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBWUEMgYW5kIG90aGVyIG5lY2Vzc2FyeSBuZXR3b3JrIHJlc291cmNlc1xuICAgIHRoaXMudnBjID0gbmV3IGVjMi5WcGModGhpcywgJ01haW5WcGMnLCB7XG4gICAgICBjaWRyOiAnMTAuMC4wLjAvMTYnLFxuICAgICAgbmF0R2F0ZXdheXM6IDEsXG4gICAgICBuYXRHYXRld2F5U3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcbiAgICAgIH0sXG4gICAgICBtYXhBenM6IDIsXG4gICAgICB2cGNOYW1lOiAnTWFpblZwYycsXG4gICAgICBnYXRld2F5RW5kcG9pbnRzOiB7XG4gICAgICAgIFMzOiB7XG4gICAgICAgICAgc2VydmljZTogZWMyLkdhdGV3YXlWcGNFbmRwb2ludEF3c1NlcnZpY2UuUzMsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgICAgbmFtZTogJ1B1YmxpYycsXG4gICAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgY2lkck1hc2s6IDI4LFxuICAgICAgICAgIG5hbWU6ICdQcml2YXRlJyxcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfTkFUXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgfSk7XG4gIFxuICAgIC8vIGNyZWF0ZSBhIHNlY3VyaXR5IGdyb3VwIGZvciBhIHdlYiBzZXJ2ZXIgdGllclxuICAgIHRoaXMud2Vic2VydmVyU0cgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ1dlYlNlcnZlclNlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGM6IHRoaXMudnBjLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiAnd2ViLXNlcnZlci1zZycsXG4gICAgICBkZXNjcmlwdGlvbjogJ3NlY3VyaXR5IGdyb3VwIGZvciBhIHdlYiBzZXJ2ZXInLFxuICAgIH0pO1xuXG4gICAgdGhpcy53ZWJzZXJ2ZXJTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAgIGVjMi5Qb3J0LnRjcCgyMiksXG4gICAgICAnYWxsb3cgU1NIIGFjY2VzcyBmcm9tIGFueXdoZXJlJyxcbiAgICApO1xuXG4gICAgdGhpcy53ZWJzZXJ2ZXJTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAgIGVjMi5Qb3J0LnRjcCg4MCksXG4gICAgICAnYWxsb3cgSFRUUCB0cmFmZmljIGZyb20gYW55d2hlcmUgb24gcG9ydCA4MCcsXG4gICAgKTtcblxuICAgIC8vIGNyZWF0ZSBhIHNlY3VyaXR5IGdyb3VwIGZvciBhIGJhY2tlbmQgc2VydmVyIHRpZXJcbiAgICB0aGlzLmJhY2tlbmRTZXJ2ZXJTRyA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnQmFja2VuZFNlcnZlclNlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGM6IHRoaXMudnBjLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiAnYmFja2VuZC1zZXJ2ZXItc2cnLFxuICAgICAgZGVzY3JpcHRpb246ICdzZWN1cml0eSBncm91cCBmb3IgYSBiYWNrZW5kIHNlcnZlcicsXG4gICAgfSk7XG5cbiAgICB0aGlzLmJhY2tlbmRTZXJ2ZXJTRy5jb25uZWN0aW9ucy5hbGxvd0Zyb20oXG4gICAgICBuZXcgZWMyLkNvbm5lY3Rpb25zKHtcbiAgICAgICAgc2VjdXJpdHlHcm91cHM6IFt0aGlzLndlYnNlcnZlclNHXSxcbiAgICAgIH0pLFxuICAgICAgZWMyLlBvcnQuYWxsVHJhZmZpYygpLFxuICAgICAgJ2FsbG93IGFsbCB0cmFmZmljIGZyb20gdGhlIHdlYnNlcnZlciBzZWN1cml0eSBncm91cCcsXG4gICAgKTtcblxuICAgIC8vIGNyZWF0ZSBhIHNlY3VyaXR5IGdyb3VwIGZvciBhIGRhdGFiYXNlIHNlcnZlciB0aWVyXG4gICAgdGhpcy5kYnNlcnZlclNHID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdEYXRhYmFzZVNlcnZlclNlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGM6IHRoaXMudnBjLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgIHNlY3VyaXR5R3JvdXBOYW1lOiAnZGF0YWJhc2Utc2VydmVyLXNnJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnc2VjdXJpdHkgZ3JvdXAgZm9yIGEgZGF0YWJhc2Ugc2VydmVyJyxcbiAgICB9KTtcblxuICAgIHRoaXMuZGJzZXJ2ZXJTRy5jb25uZWN0aW9ucy5hbGxvd0Zyb20oXG4gICAgICBuZXcgZWMyLkNvbm5lY3Rpb25zKHtcbiAgICAgICAgc2VjdXJpdHlHcm91cHM6IFt0aGlzLmJhY2tlbmRTZXJ2ZXJTR10sXG4gICAgICB9KSxcbiAgICAgIGVjMi5Qb3J0LnRjcCgzMzA2KSxcbiAgICAgICdhbGxvdyB0cmFmZmljIG9uIHBvcnQgMzMwNiBmcm9tIHRoZSBiYWNrZW5kIHNlcnZlciBzZWN1cml0eSBncm91cCcsXG4gICAgKTtcbiAgfVxufVxuIl19