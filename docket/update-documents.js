#!/usr/bin/env node
//
// Update the documents for a docket entry from PACER and import them into
// CourtAPI
//

if (process.argv.length < 5) {
  console.log("Usage: " + __filename + " <court code> <case number> <docket seq no>");
  process.exit(-1);
}

const court      = process.argv[2];
const caseNumber = process.argv[3];
const docketSeq  = process.argv[4];

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

// initialize auth headers
auth.init();

const queryApi = new CourtApi.QueryApi();

queryApi.updateDocketDocuments(court, caseNumber, docketSeq,
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
