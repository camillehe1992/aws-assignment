"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostedZoneCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const route53 = require("aws-cdk-lib/aws-route53");
const app_conf_1 = require("../config/app.conf");
class HostedZoneCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { vpc } = props;
        const { hostedZoneName } = app_conf_1.default;
        // Resources
        this.hostedZone = new route53.PrivateHostedZone(this, 'PrivateHostedZone', {
            vpc,
            zoneName: hostedZoneName
        });
    }
}
exports.HostedZoneCdkStack = HostedZoneCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdHpvbmUtY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaG9zdHpvbmUtY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUduQyxtREFBbUQ7QUFFbkQsaURBQXNDO0FBTXRDLE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJL0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUE4QjtRQUN0RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxrQkFBSSxDQUFDO1FBRWhDLFlBQVk7UUFDWixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN6RSxHQUFHO1lBQ0gsUUFBUSxFQUFFLGNBQWM7U0FDekIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaEJELGdEQWdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XHJcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xyXG5cclxuaW1wb3J0IGNvbmYgZnJvbSAnLi4vY29uZmlnL2FwcC5jb25mJztcclxuXHJcbmludGVyZmFjZSBIb3N0ZWRab25lQ2RrU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcclxuICB2cGM6IGVjMi5WcGM7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBIb3N0ZWRab25lQ2RrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIFxyXG4gIHB1YmxpYyByZWFkb25seSBob3N0ZWRab25lOiByb3V0ZTUzLlByaXZhdGVIb3N0ZWRab25lO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogSG9zdGVkWm9uZUNka1N0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIGNvbnN0IHsgdnBjIH0gPSBwcm9wcztcclxuICAgIGNvbnN0IHsgaG9zdGVkWm9uZU5hbWUgfSA9IGNvbmY7XHJcblxyXG4gICAgLy8gUmVzb3VyY2VzXHJcbiAgICB0aGlzLmhvc3RlZFpvbmUgPSBuZXcgcm91dGU1My5Qcml2YXRlSG9zdGVkWm9uZSh0aGlzLCAnUHJpdmF0ZUhvc3RlZFpvbmUnLCB7XHJcbiAgICAgIHZwYyxcclxuICAgICAgem9uZU5hbWU6IGhvc3RlZFpvbmVOYW1lXHJcbiAgICB9KTtcclxuICB9XHJcbn0iXX0=