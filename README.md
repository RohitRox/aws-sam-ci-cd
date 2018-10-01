## What is this about: Write, test, launch and deploy serverless code and infrastructure

AWS serverless application development and continuous integration/deployment(Uses NodeJs, but not tied to any specific language)

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

We then test, upload, and deploy application using the [AWS SAM CLI](https://github.com/awslabs/serverless-application-model).
SAM CLI is an open source tool for managing Serverless applications written with AWS Serverless Application Model which provides an environment for us to develop, test, and analyze your serverless applications locally before uploading them to the Lambda runtime.

Resources:
[AWS re:Invent 2017 Authoring and Deploying Serverless Applications with AWS SAM ](https://www.youtube.com/watch?v=pMyniSCOJdA)
[AWS re:Invent 2017: Local Serverless Development using SAM Local ](https://www.youtube.com/watch?v=oGawhLx3Dxo)
[AWS SAM CLI](https://github.com/awslabs/aws-sam-cli)

## Getting Started

Get the tool: [Installation Guide](https://github.com/awslabs/aws-sam-cli/blob/develop/docs/installation.rst)

Usage:

```
  $ sam init --runtime  nodejs8.10 --name apples

```

This generates a fully functional project in `apples` folder along with a sample handler at `/hello` path. A very good README is also generated along the way which contains all documentation about running, testing and deploying. It is highly recommended to go through that and all the documentation embedded the handler code.

`sam local start-api` is the command to get a local server up. This is an ideal way to test our lambda function because it actually mimics the AWS behavior. Behind the scenes, it creates a local HTTP server hosting all of our Lambda functions defined by `template.yaml`. When accessed by using a browser or the CLI, a Docker container is launched on-demand locally to invoke the function.

Resources:
[SAM Template Doc](https://docs.aws.amazon.com/lambda/latest/dg/serverless_app.html)
[More on Testing and Invoking](https://docs.aws.amazon.com/lambda/latest/dg/test-sam-cli.html)

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
