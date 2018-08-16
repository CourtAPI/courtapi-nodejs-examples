#!/usr/bin/env node
//
// Show a claim register entry for a case on CourtAPI
//

var CourtApi = require('court_api');
var handlers = require('../inc/handlers');
var auth     = require('../inc/auth');

if (process.argv.length < 5) {
  console.log("Usage: " + __filename + " <court code> <case number> <claim number>");
  process.exit(-1);
}

var court       = process.argv[2];
var caseNumber  = process.argv[3];
var claimNumber = process.argv[4]

// initialize auth headers
auth.init();

var caseApi = new CourtApi.CaseApi();

caseApi.getClaim(court, caseNumber, claimNumber,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
