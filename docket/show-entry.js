#!/usr/bin/env node
//
// Show a specific docket entry for a case on CourtAPI
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

caseApi.getDocketEntry(court, caseNumber, docketSeq,
  function (error, data, response) {
    if (error) {
      console.error("ERROR: " + error.status);
      console.error(error.response.body);
    }

    console.log(JSON.stringify(response.body, null, 2));
  }
);
