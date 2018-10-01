'use strict';

const list = require('../../src/list');
const chai = require('chai');
const expect = chai.expect;
var event, context;

describe('ListApples', function () {
  it('verifies successful response', async () => {
    const result = await list.handler(event, context, (err, result) => {
      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an('string');

      let response = JSON.parse(result.body);

      expect(response).to.be.an('object');
      expect(response.message).to.be.equal("Hello world. I give you a list of apples.");
      expect(response.location).to.be.an("string");
    });
  });
});

