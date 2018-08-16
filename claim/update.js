#!/usr/bin/env node
//
// Purchase and import the claims register for a case into CourtAPI from PACER
//

var CourtApi = require('court_api');
var handlers = require('../inc/handlers');
var auth     = require('../inc/auth');

if (process.argv.length < 4) {
  console.log("Usage: " + __filename + " <court code> <case number>");
  process.exit(-1);
}

var court      = process.argv[2];
var caseNumber = process.argv[3];

// initialize auth headers
auth.init();

var queryApi = new CourtApi.QueryApi();

queryApi.updateClaims(court, caseNumber, null,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
