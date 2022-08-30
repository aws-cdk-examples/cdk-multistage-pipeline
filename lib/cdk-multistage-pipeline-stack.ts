import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HostedZoneAttributes } from "aws-cdk-lib/aws-route53";
import * as pipelines from "aws-cdk-lib/pipelines";
import { AppStage } from "./app-stage";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface CdkMultistagePipelineStackProps extends cdk.StackProps {
  zoneAttrs: HostedZoneAttributes;
  branch: string;
}

export class CdkMultistagePipelineStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: CdkMultistagePipelineStackProps
  ) {
    super(scope, id, props);

    const zoneAttrs = props.zoneAttrs;
    const branch = props.branch;
    const apiSubdomain = "api"; // resolves as api.example.com

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      pipelineName: "cdk-multistage-pipeline",
      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.gitHub(
          "aws-cdk-examples/cdk-multistage-pipeline",
          branch
        ),
        commands: [
          "npm ci",
          "npm run build",
          `npx cdk synth ${this.stackName}`,
        ],
        additionalInputs: {
          "../cdk-multistage-web": pipelines.CodePipelineSource.gitHub(
            "aws-cdk-examples/cdk-multistage-web",
            branch
          ),
        },
        installCommands: [
          "cd ../cdk-multistage-web",
          "npm install",
          "npm run build",
          "cd -",
        ],
        env: {
          REACT_APP_URL: `https://${zoneAttrs.zoneName}`,
          REACT_APP_API_URL: `https://${apiSubdomain}.${zoneAttrs.zoneName}`,
        },
      }),
    });

    pipeline.addStage(
      new AppStage(this, "AppStage", {
        zoneAttrs,
        apiSubdomain,
      })
    );
  }
}
