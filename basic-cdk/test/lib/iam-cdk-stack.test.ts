import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as Stack from '../../lib/iam-cdk-stack';

let app: cdk.App;
let stack: cdk.Stack;
let template: cdk.assertions.Template;

describe('IamCdkStack', () => {
  beforeAll(() => {
    app = new cdk.App();
    stack = new Stack.IamCdkStack(app, 'IamCdkStack');
    template = Template.fromStack(stack);
  });
  
  test('should create ECS instance role', () => {
    template.hasResourceProperties('AWS::IAM::Role', Match.objectLike({
      RoleName: 'EC2_Instance_Role'
    }));
  });
  
  test('should create ECS task execution role', () => {
    template.hasResourceProperties('AWS::IAM::Role', Match.objectLike({
      RoleName: 'ECS_Task_Execution_Role'
    }));
  });
  
  test('should create ECS task execution role', () => {
    template.hasResourceProperties('AWS::IAM::Role', Match.objectLike({
      RoleName: 'ECS_Task_Role'
    }));
  });
});