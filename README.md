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
SAM tools provide a richer execution environment on our machine than just running Node.js(code) alone.

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

## Swagger Integration

AWS SAM supports inline as well as external Swagger and some CloudFormation Intrinsic Functions. For real world scenario we probably want to have a separate swagger configuration file.

[Amazon API Gateway Definition](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessapi)

Let's first focus on swagger. Once we have a swagger config, we would like to have a UI to see it.
This one command ```docker run -p 8080:8080 -e "SWAGGER_JSON=/mnt/swagger.yaml" -v `pwd`:/mnt swaggerapi/swagger-ui``` will run a docker container at port 8080 for documentation viewing. This is desired way because all the swagger tools and dependencies are encapsulated inside `swaggerapi/swagger-ui` docker image and we don't any thing related to it in our project. Nice, clean and quick.

Next, the integration with AWS comes with the attribute `x-amazon-apigateway-integration`, which is an AWS-specific extension to Swagger.

[Read on x-amazon-apigateway-integration ](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-as-lambda-proxy-export-swagger-with-extensions.html)

This consists of the configuration that is responsible for mapping and transforming the request and response from the RESTful endpoint to the specified AWS service.

Important properties are:
 - `uri` specifies which Lambda function shall be invoked.

- `responses` specify rules how to transform the responses returned by the function. As we are using Lambda Proxy Integration, we don’t need any specific rule.

- `type` defines that we want to use Lambda Proxy Integration, and thereby we have to set httpMethod to "POST", as this is what Lambda functions expect.

A simplistic example:

```yaml
  # template.yaml
  Resources:
    ApplesApiGateway:
      Type: AWS::Serverless::Api
      Properties:
        StageName: live
        DefinitionUri: ./swagger.yaml
        Variables:
          ListApplesFunction: !Ref ListApples

    ListApples:
      Type: AWS::Serverless::Function
      Properties:
        Handler: src/list.handler
        Runtime: nodejs8.10
        Environment:
          Variables:
            PARAM1: VALUE
        Events:
          ListApples:
            Type: Api
            Properties:
              RestApiId: !Ref ApplesApiGateway
              Path: /apples
              Method: get
```

```yaml
  # swagger.yaml
  paths:
    /apples:
      get:
        summary: Get apples
        description: Details on getting apples
        responses: {}
        x-amazon-apigateway-integration:
          type: aws_proxy
          uri: arn:aws:apigateway:<REGION>:lambda:path/2015-03-31/functions/arn:aws:lambda:<REGION>:<ACCOUNT_ID>:function:${stageVariables.ListApplesFunction}/invocations
          httpMethod: POST
          responses: {}
```
The `REGION` and `ACCOUNT_ID` needs to be hard-coded for now. There are issues in github about this. `${stageVariables.ListApplesFunction}` grabs the function set in the template using `Variables` property in `AWS::Serverless::Api` declaration.

The `x-amazon-apigateway-integration` can be configured to have various kinds of checks and validations so that invalid requests can be aborted beforehand before triggering lamda.

# External AWS Resources

Docker based solutions can be easily integrated with sam cli to create an development environement that needs external resources like DynamoDB. In this project, image `cnadiminti/dynamodb-local` is being used to start a dynamodb server. We just need to make sure that both sam local containers and services runs on the same docker network.

```
  docker network ls|grep lambda-local > /dev/null || docker network create lambda-local # only create if does not exist
  docker run -d -v `pwd`:/dynamodb_local_db -p 8000:8000 --network lambda-local --name dynamodb cnadiminti/dynamodb-local
	sam local start-api --docker-network lambda-local
```

This can be nicely organized in a Makefile.

However, SAM will not be able to create actual table/data in local environment though.
Following snippet,

```yaml
  DynamoApplesTable:
    Type: AWS::Serverless::SimpleTable
    TableName: ApplesTable
    PrimaryKey:
      Name: AppleId
      Type: String
    ProvisionedThroughput:
      ReadCapacityUnit: 5
      WriteCapacityUnits: 5
```

will actually create a table and attributes. We'll have to write our own script to actually prepare database for us.

Refer to `dynamo/dbcreate/local.js` to see how table and seed data can be created and this can be invoked via Makefile.

The idea here is to have all dependencies and seed data with minimal effort, not have or have minimal external libraries and a nice defined workflow that can be applied to all projects.
