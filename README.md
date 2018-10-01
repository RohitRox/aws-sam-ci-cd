## What is this about: Write, test, launch and deploy serverless code and infrastructure

AWS serverless application development and continuous integration/deployment

- Not about specific language or platform
- Not about what are Lambdas and AWS Api Gateways themselves

Topics:
- Development with AWS SAM
- Patterns for code organization and self-documentating APIs
- AWS SAM packaging and deployments
- CI/CD with AWS CodePipeline
- Safe AWS Lambda deployment strategies

## AWS SAM

The AWS Serverless Application Model (AWS SAM) is a model or specifications to define serverless applications on AWS. This model allows us to create and manage resources used in our application using AWS CloudFormation.

To create a serverless application using SAM, first, we'll need to create a SAM template which is a configuration file that describes our Lambda functions, API endpoints and the other resources in our application.

SAM templates looks and feels similar to cloudformation templates (actually transforms to a cloudformation template) but simplifies and abstracts the management of serverless resources as illustrated here:
![A SAM template](https://image.slidesharecdn.com/3-170603004817/95/building-aws-lambda-applications-with-the-aws-serverless-application-model-aws-sam-june-2017-aws-online-tech-talks-16-638.jpg?cb=1496451007 "A SAM template")
![SAM template resources](https://image.slidesharecdn.com/srv311-authoring-and-deploying-8533218c-51bf-4889-8f9e-6a3f52380159-1404412007-171213232428/95/authoring-and-deploying-serverless-applications-with-aws-sam-srv311-reinvent-2017-17-638.jpg?cb=1513207484, "SAM template resources")

We then test, upload, and deploy application using the [AWS SAM CLI](https://github.com/awslabs/serverless-application-model).
SAM CLI is an open source tool for managing Serverless applications written with AWS Serverless Application Model which provides an environment for us to develop, test, and analyze our serverless applications locally before uploading them to the Lambda runtime.

Resources:
- [AWS re:Invent 2017 Authoring and Deploying Serverless Applications with AWS SAM ](https://www.youtube.com/watch?v=pMyniSCOJdA)
- [AWS re:Invent 2017: Local Serverless Development using SAM Local ](https://www.youtube.com/watch?v=oGawhLx3Dxo)
- [AWS SAM CLI](https://github.com/awslabs/aws-sam-cli)

## Getting Started

Get the tool: [Installation Guide](https://github.com/awslabs/aws-sam-cli/blob/develop/docs/installation.rst)

Usage:

```
  $ sam init --runtime  nodejs8.10 --name apples

```

This generates a fully functional project in `apples` folder along with a sample handler at `/hello` path. A very good README is also generated along the way which contains all documentation about running, testing and deploying. It is highly recommended to go through that and all the documentation embedded the handler code.

`sam local start-api` is the command to get a local server up. This is an ideal way to test our lambda function because it actually mimics the AWS behavior. Behind the scenes, it creates a local HTTP server hosting all of our Lambda functions defined by `template.yaml`. When accessed by using a browser or the CLI, a Docker container is launched on-demand locally to invoke the function.

The template can be validated using `sam validate -t path/to/template.yaml`.
There are excellent plugins available for vscode and sublime text for catching template bugs.

Resources:
- [SAM Template Doc](https://docs.aws.amazon.com/lambda/latest/dg/serverless_app.html)
- [More on Testing and Invoking](https://docs.aws.amazon.com/lambda/latest/dg/test-sam-cli.html)

## Code Organization

There are many ways we can organize our code. Sam Cli generates a fodler structure when we init a project. It assumes the root folder to be a service and each source folders to be a micro-service, a lambda. Each micro-service folders are expected to have their own `package.json` and tests.

For simplicity, I am rearranging the structure to look something like this:

```
  |
  |- src
      |- list.js    # lambda handler for list api endpoint
  |- tests          # tests
  |- .nvmrc         # node version specification
  |- package.json   # dependencies
  |- template.yaml  # sam template
  |- swagger.yaml   # swagger for api specification (next step)
  |- Makefile       # abstract scripts

```
A sample Makefile

```yaml
  server:
    sam local start-api
  test:
    npm test
  lint:
    echo 'Will run lint'
```

## Deploy

A basic deploy happens in two steps: packaging, uploading sam template to s3 and deploying with AWS Cloudformation. Of course we can use AWS console but that's not a desired flow. The AWS CLI provides us with all the necessary commands that automate all these steps. Although, later we would like deploy to be handled by AWS Codepipeline, it is always good to know what happens in the inside.

We will need to create an S3 bucket for AWS Cloudformation to use to upload our deployment package (Cloudformation itself is a different topic and will not be covered here).

S3 bucket can be quickly created by:

```bash
  $ aws s3 mb s3://bucket-name
```

```bash
  $ aws cloudformation package --template-file template.yaml --s3-bucket lambda-deploy-pkgs --output-template-file template-out.yaml --profile aws-profile

```

This transforms and creates a template named `template-out.yaml` that contains the CodeUri that points to the deployment zip in the Amazon S3 bucket that we specified and this template represents our serverless application. We are now ready to deploy it.

```bash
  $ aws cloudformation deploy --template-file template-out.yaml --stack-name SAMApples --capabilities CAPABILITY_IAM --profile aws-profile

```
This wil deploy the packaged template to a stack named `SAMApples`. Under the hood it creates and executes a changeset and waits until the deployment completes. `--capabilities` parameter is required to explicitly acknowledge that AWS CloudFormation is allowed to create roles on our behalf.

Once deployed, you can investigate on all the resources it created for our application. See output section of the stack to test the endpoint.

UPDATE:

SAM CLI now comes with commands for deployment as well.

```
  $ sam package --template-file template.yaml --s3-bucket mybucket --output-template-file template-out.yaml
  $ sam deploy --template-file ./template-out.yaml --stack-name mystack --capabilities CAPABILITY_IAM
  $ sam logs -n MyFunction --stack-name mystack # fetch logs using the function's LogicalID
```

[Full Doc](https://docs.aws.amazon.com/lambda/latest/dg/test-sam-cli.html)

## API Gateway And Swagger/ OpenAPI Specification

The earlier sample example works just fine, it automatically creates an API Gateway for us, but for a real world application we might want to have granular control over API Gateway configurations and validations, or have multiple gateways. If you noted in earlier example, SAM automatically creates a default stage named 'Prod', perhaps we want to have multiple stages and control deployment behaviour. Or perhaps we would like to do API Design First approach. In all cases, we can design an api gateway `AWS::Serverless::Api` with OpenAPI Specification.

What might happen in an API Gateway

![API Gateway internals](https://cloudonaut.io/images/2015/11/API-Gateway-Internals.png "API Gateway internals")

We can use OpenAPI Specification formerly known as Swagger Specification to define the API and API Gateway in combination with Lambda to implement the API.

We can design our development flow to use swagger to document our API and also use the same definitions for SAM template. The cool thing about this is that the API definition can be used by the server that implements the API and the clients that use the API.

Resource:
- [About Swagger/ OpenAPI Specification](https://swagger.io/docs/specification/about/)


