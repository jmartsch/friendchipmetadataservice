'use strict';

const request = require('supertest');
const app = require('../../../api.js');
const assert = require('chai').assert;

var basicSites = {
  objects: [
    {
      url: 'https://www.mozilla.org/en-GB/'
    }
  ]
};

describe('Basic parsing', () => {
  it('should give us compatible output with Google PW service', (done) => {
    request(app)
      .post('/metadata/')
      .send(basicSites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];
        // Check basic fields 
        ['id', 'url', 'displayUrl', 
          'title', 'description', 'icon'].forEach((field) => {
          assert.isNotNull(result[field]);
        });

        assert.equal(result.id, result.url);
        assert.equal(result.id, result.displayUrl);

        done();
      });
  });

  it('should give information of several sites at once', (done) => {
    var sites = Object.assign({}, basicSites);
    sites.objects.push({
      url: 'https://www.facebook.com'
    });
    request(app)
      .post('/metadata')
      .send(sites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 2);

        done();
      });
  });

  it('should unwrap shorted urls', (done) => {
    var sites = {
      objects: [{url: 'http://bit.ly/1Q3Pb6u'}]
    };
    var originalUrl = 'https://twitter.com/mepartoconmigo';
    request(app)
      .post('/metadata')
      .send(sites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];

        assert.equal(result.displayUrl, originalUrl);
        done();
      });
  });
});