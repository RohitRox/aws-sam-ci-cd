const TableParams = {
  TableName: 'ApplesTable',
  KeySchema: [
    {
      AttributeName: 'Location',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'AppleId',
      KeyType: 'RANGE',
    }
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'AppleId',
      AttributeType: 'S',
    },
    {
      AttributeName: 'Location',
      AttributeType: 'S',
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'xxxx',
  secretAccessKey: 'xxxx',
  endpoint: 'http://localhost:8000'
});

const dynamodb = new AWS.DynamoDB()
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

dynamodb.createTable(TableParams, function(err, data) {
  if (err) console.log(err);
  else console.log(data);
});

const applesSeed = [
  {
    id: "1",
    location: "Asia",
  },
  {
    id: "2",
    location: "Europe",
  }
]

applesSeed.forEach(function(apple) {
  const params = {
    TableName: TableParams.TableName,
    Item: {
      AppleId: apple.id,
      Location: apple.location
    }
  };

  dynamoDbClient.put(params, function(err, data) {
    if (err) {
      console.error("Error JSON: ", JSON.stringify(err, null, 2));
    } else {
      console.log("Apple stored: ", JSON.stringify(apple));
    }
  });
});
