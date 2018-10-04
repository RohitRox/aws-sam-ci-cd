server:
	docker network ls|grep lambda-local > /dev/null || docker network create lambda-local
	DYNAMODB_TABLE_NAME=ApplesTable AWS_REGION=us-east-1 sam local start-api --docker-network lambda-local
	# Environment variables don't get set with referenced Parameters default values.
	# Ref template.yaml how we are setting table name for DynamoApplesTable
test:
	npm test
lint:
	echo 'Will run lint'
deploy:
	aws cloudformation package --template-file template.yaml --s3-bucket aws-pipeline-cfn-sam-lambda  --output-template-file template-out.yaml --profile staging
	aws cloudformation deploy --template-file template-out.yaml  --stack-name SAMApples --capabilities CAPABILITY_IAM --profile staging
swagger:
	docker run -p 8080:8080 -e "SWAGGER_JSON=/mnt/swagger.yaml" -v `pwd`:/mnt swaggerapi/swagger-ui
dynamo:
	docker network ls|grep lambda-local > /dev/null || docker network create lambda-local
	docker run -d -v `pwd`:/dynamodb_local_db -p 8000:8000 --network lambda-local --name dynamodb cnadiminti/dynamodb-local
dbcreate:
	node ./dynamo/dbcreate.local.js

.PHONY: server test lint deploy swagger dynamo dbcreate
