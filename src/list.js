
let response;

const Dynamo = require('./dynamo');

exports.handler = (event, context, callback) =>  {
  console.log('Dynamo Client: ', Dynamo.client());
  console.log('Scanning Table:', process.env.DYNAMODB_TABLE_NAME);

  Dynamo.client().scan({ TableName: process.env.DYNAMODB_TABLE_NAME }, (err, data) => {
    if (err) {
      console.log('[ERROR]', err, err.stack);
      callback({ statusCode: 500, body: JSON.stringify(err) });
    } else {
      console.log('[INFO]', JSON.stringify(data));
      response = {
        message: 'Got some apples for you',
        data: data.Items
      }
      callback(null, { statusCode: 200, body: JSON.stringify(response) });
    }
  })
};
