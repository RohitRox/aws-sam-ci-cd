const AWS = require('aws-sdk')

AWS.config.update({ region: process.env.AWS_REGION });

if (process.env.AWS_SAM_LOCAL) {
  AWS.config.update({
    endpoint: 'http://dynamodb:8000'
  });
}

let dynamoDbClient;

const makeClient = () => {
  dynamoDbClient = new AWS.DynamoDB.DocumentClient()
  return dynamoDbClient
}

module.exports = {
  client: () => dynamoDbClient || makeClient()
}
