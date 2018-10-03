server:
	sam local start-api
test:
	npm test
lint:
	echo 'Will run lint'
deploy:
	aws cloudformation package --template-file template.yaml --s3-bucket lambda-deploy-pkgs --output-template-file template-out.yaml --profile staging
	aws cloudformation deploy --template-file template-out.yaml  --stack-name SAMApples --capabilities CAPABILITY_IAM --profile staging
swagger:
	docker run -p 8080:8080 -e "SWAGGER_JSON=/mnt/swagger.yaml" -v `pwd`:/mnt swaggerapi/swagger-ui
