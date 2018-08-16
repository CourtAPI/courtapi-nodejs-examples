#!/usr/bin/env node
//
// Buy a docket document part from PACER and import it into CourtAPI
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

var queryApi = new CourtApi.QueryApi();

queryApi.buyDocketDocument(court, caseNumber, docketSeq, partNo,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
