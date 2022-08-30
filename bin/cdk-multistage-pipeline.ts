#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkMultistagePipelineStack } from "../lib/cdk-multistage-pipeline-stack";

const app = new cdk.App();

const dev = new CdkMultistagePipelineStack(app, "dev-multistage-pipeline", {
  stackName: "dev-multistage-pipeline",
  // env: {account: '000000000000'},
  branch: "main",
  zoneAttrs: {
    zoneName: "dev.pretty-solution.com", // api will be api.dev.pretty-solution.com
    hostedZoneId: "Z0422612PVJUMUP3RGZL",
  },
});

const prod = new CdkMultistagePipelineStack(app, "prod-multistage-pipeline", {
  stackName: "prod-multistage-pipeline",
  // env: {account: '111111111111'},
  branch: "prod",
  zoneAttrs: {
    zoneName: "pretty-solution.com", // api will be api.pretty-solution.com
    hostedZoneId: "Z0352112PVJUMUP6RGZL",
  },
});
