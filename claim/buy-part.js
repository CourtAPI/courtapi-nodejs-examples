#!/usr/bin/env node
//
// Purchase a claim register document part from PACER and import it into CourtAPI
//

var CourtApi = require('court_api');
var handlers = require('../inc/handlers');
var auth     = require('../inc/auth');

if (process.argv.length < 7) {
  console.log("Usage: " + __filename + " <court code> <case number> <claim number> <claim seq no> <part no>");
  process.exit(-1);
}

var court        = process.argv[2];
var caseNumber   = process.argv[3];
var claimNumber  = process.argv[4]
var claimSeqNo   = process.argv[5]
var claimPartNo  = process.argv[6]

// initialize auth headers
auth.init();

var queryApi = new CourtApi.QueryApi();

queryApi.buyClaimDocument(court, caseNumber, claimNumber, claimSeqNo, claimPartNo,
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
