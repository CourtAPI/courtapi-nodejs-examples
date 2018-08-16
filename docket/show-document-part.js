#!/usr/bin/env node
//
// Show a document part for a specific docket entry on CourtAPI
//

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

if (process.argv.length < 6) {
  console.log("Usage: " + __filename + " <court code> <case number> <docket seq no> <part number>");
  process.exit(-1);
}

var court      = process.argv[2];
var caseNumber = process.argv[3];
var docketSeq  = process.argv[4];
var partNo     = process.argv[5];

// initialize auth headers
auth.init();

var caseApi = new CourtApi.CaseApi();

caseApi.getDocketDocument(court, caseNumber, docketSeq, partNo,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
