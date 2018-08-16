#!/usr/bin/env node
//
// List claim parts for a claim registry entry
//

var CourtApi = require('court_api');
var handlers = require('../inc/handlers');
var auth     = require('../inc/auth');

if (process.argv.length < 6) {
  console.log("Usage: " + __filename + " <court code> <case number> <claim number> <claim seq no>");
  process.exit(-1);
}

var court       = process.argv[2];
var caseNumber  = process.argv[3];
var claimNumber = process.argv[4]
var claimSeqNo  = process.argv[5]

// initialize auth headers
auth.init();

var caseApi = new CourtApi.CaseApi();

caseApi.getClaimParts(court, caseNumber, claimNumber, claimSeqNo,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
