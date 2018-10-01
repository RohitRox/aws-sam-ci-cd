
const axios = require('axios')
const url = 'http://checkip.amazonaws.com/';
let response;

exports.handler = async (event, context) => {
  try {
    const res = await axios(url);
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello world. I give you a list of apples.',
        location: res.data.trim()
      })
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};
