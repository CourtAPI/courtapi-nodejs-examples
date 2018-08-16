#!/usr/bin/env node
//
// Save your PACER credentials
//
// Usage save-pacer-credentials.js <pacer username> <pacer password>
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

if (process.argv.length < 4) {
    console.log("Usage: " + __filename + " username password");
    process.exit(-1);
}

const pacerUser = process.argv[2];
const pacerPass = process.argv[3];

auth.init();

const pacerApi = new CourtApi.PacerCredentialsApi();

// Create / Update PACER credentials
pacerApi.saveCredentials(
  { pacerUser: pacerUser, pacerPass: pacerPass },
  (error, data, response) => {
    if (error)
      return handlers.errorHandler(error);
    else
      console.log('Pacer credentials stored successfully');
  }
);
