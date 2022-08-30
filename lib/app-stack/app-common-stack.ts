import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";

interface AppCommonStackProps extends cdk.StackProps {
  zoneAttrs: route53.HostedZoneAttributes;
}

export class AppCommonStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: DnsValidatedCertificate;

  constructor(scope: Construct, id: string, props: AppCommonStackProps) {
    super(scope, id, props);

    const zoneAttrs = props.zoneAttrs;

    // ################## Hosted Zone and Certificate ######################
    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      zoneAttrs
    );

    this.certificate = new DnsValidatedCertificate(
      this,
      "DnsValidatedCertificate",
      {
        hostedZone: this.hostedZone,
        domainName: this.hostedZone.zoneName,
        subjectAlternativeNames: [`*.${this.hostedZone.zoneName}`],
      }
    );

    // this.vpc = new ec2.Vpc(this, 'Vpc', {
    //   cidr: '10.0.0.0/16',
    //   natGateways: 1,
    //   subnetConfiguration: [
    //     {
    //       name: 'public',
    //       subnetType: ec2.SubnetType.PUBLIC,
    //       cidrMask: 24,
    //     },
    //     {
    //       name: 'private',
    //       subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
    //       cidrMask: 24,
    //     },
    //   ],
    // })
  }
}
