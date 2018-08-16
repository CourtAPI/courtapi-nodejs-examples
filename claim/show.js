#!/usr/bin/env node
//
// Show a claim register entry for a case on CourtAPI
//

const CourtApi = require('court_api');
const handlers = require('../inc/handlers');
const auth     = require('../inc/auth');

if (process.argv.length < 5) {
  console.log("Usage: " + __filename + " <court code> <case number> <claim number>");
  process.exit(-1);
}

const court       = process.argv[2];
const caseNumber  = process.argv[3];
const claimNumber = process.argv[4]

// initialize auth headers
auth.init();

const caseApi = new CourtApi.CaseApi();

caseApi.getClaim(court, caseNumber, claimNumber,
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
