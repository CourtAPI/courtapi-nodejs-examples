#!/usr/bin/env node
//
// List the documents for a specific case docket entry
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

if (process.argv.length < 5) {
  console.log("Usage: " + __filename + " <court code> <case number> <docket seq no>");
  process.exit(-1);
}

const court      = process.argv[2];
const caseNumber = process.argv[3];
const docketSeq  = process.argv[4];

// initialize auth headers
auth.init();

const caseApi = new CourtApi.CaseApi();

caseApi.getDocketDocuments(court, caseNumber, docketSeq,
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
