#!/usr/bin/env node
//
// Purchase the docket sheet for a case from PACER and import it into CourtAPI
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

var options = { };

var queryApi = new CourtApi.QueryApi();

queryApi.updateDockets(court, caseNumber, options,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log("Case docket updated.");
    console.log(JSON.stringify(response.body, null, 2));
  }
);
