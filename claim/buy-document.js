#!/usr/bin/env node
//
// Purchase a claim register document part from PACER and import it into CourtAPI
//

const CourtApi = require('court_api');
const handlers = require('../inc/handlers');
const auth     = require('../inc/auth');

if (process.argv.length < 7) {
  console.log("Usage: " + __filename + " <court code> <case number> <claim number> <claim seq no> <part no>");
  process.exit(-1);
}

const court        = process.argv[2];
const caseNumber   = process.argv[3];
const claimNumber  = process.argv[4]
const claimSeqNo   = process.argv[5]
const claimPartNo  = process.argv[6]

// initialize auth headers
auth.init();

const queryApi = new CourtApi.QueryApi();

queryApi.buyClaimDocument(court, caseNumber, claimNumber, claimSeqNo, claimPartNo,
  (error, data, response) => {
    if (error)
      return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
