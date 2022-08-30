import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Bucket, CorsRule, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Duration } from "aws-cdk-lib";
import * as s3_deployment from "aws-cdk-lib/aws-s3-deployment";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

interface AppWebStackProps extends cdk.StackProps {
  hostedZone: route53.IHostedZone;
  certificate: DnsValidatedCertificate;
}

export class AppWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppWebStackProps) {
    super(scope, id, props);

    const hostedZone = props.hostedZone;
    const certificate = props.certificate;

    // ################## website S3 Bucket ######################

    const websiteBucket = new Bucket(this, "websiteBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

    const distribution = new Distribution(this, "CloudFrontWebDistribution", {
      defaultBehavior: {
        origin: new S3Origin(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [hostedZone.zoneName, `www.${hostedZone.zoneName}`],
      certificate,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
      ],
    });

    new s3_deployment.BucketDeployment(this, "BucketDeployment", {
      sources: [s3_deployment.Source.asset("../cdk-multistage-web/build")],
      destinationBucket: websiteBucket,
      distributionPaths: ["/*"],
      distribution,
    });

    new route53.ARecord(this, "ARecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new CloudFrontTarget(distribution)
      ),
    });

    new route53.CnameRecord(this, "CnameRecord", {
      recordName: "www",
      zone: hostedZone,
      domainName: hostedZone.zoneName,
    });
  }
}
