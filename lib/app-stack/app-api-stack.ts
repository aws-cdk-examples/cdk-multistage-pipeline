import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {
  MockIntegration,
  PassthroughBehavior,
} from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";

interface AppApiStackProps extends cdk.StackProps {
  apiSubdomain: string;
  hostedZone: route53.IHostedZone;
  certificate: DnsValidatedCertificate;
}

export class AppApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppApiStackProps) {
    super(scope, id, props);

    const apiSubdomain = props.apiSubdomain;
    const hostedZone = props.hostedZone;
    const certificate = props.certificate;

    const api = new apigateway.RestApi(this, "books-api", {
      domainName: {
        domainName: `${apiSubdomain}.${hostedZone.zoneName}`,
        certificate,
      },
      defaultCorsPreflightOptions: {
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowCredentials: true,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    api.root.addMethod(
      "ANY",
      new MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Credentials":
                "'false'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,GET,PUT,POST,DELETE'",
            },
            responseTemplates: {
              "application/json": '{ "data": "Hello world" }',
            },
          },
        ],
        passthroughBehavior: PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": '{ "statusCode": 200 }',
        },
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    new route53.ARecord(this, "CustomDomainAliasRecord", {
      recordName: apiSubdomain,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new ApiGateway(api)),
    });
  }
}
