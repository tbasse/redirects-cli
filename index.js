#!/usr/bin/env node

var urlUtil = require('url');
var http = require('http');
var https = require('https');

var url = process.argv[2];
var agent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36';
const urlObj = urlUtil.parse(url);

const output = [''];

if (urlObj.protocol === null) {
  output.push('>> Missing protocol - using http: instead');
  urlObj.protocol = 'http:';
  urlObj.href = `${urlObj.protocol}//${urlObj.href}`;
  output.push(urlObj.href);
}
output.push('');

var options = {
  url: urlObj.href,
  method: 'GET',
  headers: {
    'User-Agent': agent,
  },
};

var count = 0;

const request = (url, cb) => {
  const protocol = urlUtil.parse(url).protocol;
  if (protocol === 'http:') {
    return http.get(url, cb);
  } else if (protocol === 'https:') {
    return https.get(url, cb);
  }

  throw new Error(`Protocol "${protocol}" not supported`);
  return;
};

function makeRequest() {
  request(options.url, (response) => {
    if (response.statusCode >= 300 && response.statusCode <= 399) {
      console.log(`${response.statusCode} -> ${response.headers.location}`);
      count++;
      options.url = urlUtil.resolve(url, response.headers.location);
      makeRequest();
    } else {
      console.log(
        `${response.statusCode} // ${response.headers['content-type']}`
      );
      console.log('');
      console.log(`${count} redirect${count > 1 ? 's' : ''}`);
    }
  }).on('error', (e) => {
    console.error(e);
  });
}

output.forEach((line) => console.log(line));
makeRequest();
