# A React SPA web page in cdk codepipeline for multiple environments
In this example I have two different environments (dev and prod), 
each environment represents an AWS account connected to a dedicated branch (DEV env is main branch, and PROD is prod respectively) 
of a GitHub repository with a SelfMutation CodePipeline and an Api Gateway sample in it (i.e. `aws-cdk-examples/cdk-multistage-pipeline`).
Additional CodePipeline Source input is a repository with React app (i.e. `aws-cdk-examples/cdk-multistage-web`)  
Incoming PRs in main branch (either `cdk-multistage-pipeline` or `cdk-multistage-web` repo)  get deployed in DEV Account, and if prod in Prod account respectively.

### prerequisites
1. at least 2 aws accounts
2. github-token in Secret Manager (each account, default region)
3. Route53 zone (each account)
4. built clone of [cdk-multistage-web](https://github.com/aws-cdk-examples/cdk-multistage-web) in ../cdk-multistage-web

### steps to reproduce 
1. Fork `aws-cdk-examples/cdk-multistage-pipeline` and `aws-cdk-examples/cdk-multistage-web`
2. Setup `github-api` [tokens](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines.CodePipelineSource.html#static-gitwbrhubrepostring-branch-props) 
3. Rename `repoString` in CodePipeline props
4. commit changes !!!
5. $ `asp dev-profile` - activate aws profile of DEV
6. $ `cdk deploy dev-multistage-pipeline`

7. $ `asp prod-profile` - activate aws profile of PROD
8. $ `cdk deploy prod-multistage-pipeline`

### Testing
1. Commits\PR merges in `cdk-multistage-pipeline` or `cdk-multistage-web` should trigger the pipeline.