import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HostedZoneAttributes } from "aws-cdk-lib/aws-route53";
import { AppCommonStack } from "./app-stack/app-common-stack";
import { AppWebStack } from "./app-stack/app-web-stack";
import { AppApiStack } from "./app-stack/app-api-stack";

interface AppStageProps extends cdk.StageProps {
  zoneAttrs: HostedZoneAttributes;
  apiSubdomain: string;
}

export class AppStage extends cdk.Stage {
  constructor(scope: Construct, stageName: string, props: AppStageProps) {
    super(scope, stageName, props);

    const apiSubdomain = props.apiSubdomain;
    const zoneAttrs = props.zoneAttrs;

    const appCommonStack = new AppCommonStack(this, "appCommonStack", {
      zoneAttrs,
    });
    const hostedZone = appCommonStack.hostedZone;
    const certificate = appCommonStack.certificate;

    const mySpaApp = new AppWebStack(this, "Web", {
      hostedZone,
      certificate,
    });

    const apiStack = new AppApiStack(this, "Api", {
      apiSubdomain,
      hostedZone,
      certificate,
    });
  }
}
