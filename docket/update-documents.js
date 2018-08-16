#!/usr/bin/env node
//
// Update the documents for a docket entry from PACER and import them into
// CourtAPI
//

if (process.argv.length < 5) {
  console.log("Usage: " + __filename + " <court code> <case number> <docket seq no>");
  process.exit(-1);
}

var court      = process.argv[2];
var caseNumber = process.argv[3];
var docketSeq  = process.argv[4];

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

// initialize auth headers
auth.init();

var queryApi = new CourtApi.QueryApi();

queryApi.updateDocketDocuments(court, caseNumber, docketSeq,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
