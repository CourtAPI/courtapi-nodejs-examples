#!/usr/bin/env node
//
// Update parts of a claim register entry from PACER and import into CourtAPI
//

const CourtApi = require('court_api');
const handlers = require('../inc/handlers');
const auth     = require('../inc/auth');

if (process.argv.length < 6) {
  console.log("Usage: " + __filename + " <court code> <case number> <claim number> <claim seq no>");
  process.exit(-1);
}

const court       = process.argv[2];
const caseNumber  = process.argv[3];
const claimNumber = process.argv[4]
const claimSeqNo  = process.argv[5]

// initialize auth headers
auth.init();

const queryApi = new CourtApi.QueryApi();

queryApi.updateClaimParts(court, caseNumber, claimNumber, claimSeqNo,
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
