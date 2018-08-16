#!/usr/bin/env node
//
// Save your PACER credentials
//
// Usage save-pacer-credentials.js <pacer username> <pacer password>
//

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

if (process.argv.length < 4) {
    console.log("Usage: " + __filename + " username password");
    process.exit(-1);
}

auth.init();

var pacerApi = new CourtApi.PacerCredentialsApi();

var pacerUser = process.argv[2];
var pacerPass = process.argv[3];

// Create / Update PACER credentials
pacerApi.saveCredentials({
    pacerUser: pacerUser,
    pacerPass: pacerPass
  },
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);
    else
      console.log('Pacer credentials stored successfully');
  }
);
