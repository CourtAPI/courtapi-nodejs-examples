#!/usr/bin/env node
//
// List the documents for a specific case docket entry
//

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

if (process.argv.length < 5) {
  console.log("Usage: " + __filename + " <court code> <case number> <docket seq no>");
  process.exit(-1);
}

var court      = process.argv[2];
var caseNumber = process.argv[3];
var docketSeq  = process.argv[4];

// initialize auth headers
auth.init();

var caseApi = new CourtApi.CaseApi();

caseApi.getDocketDocuments(court, caseNumber, docketSeq,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
