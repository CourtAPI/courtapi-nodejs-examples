#!/usr/bin/env node
//
// Show a document part for a specific docket entry on CourtAPI
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

if (process.argv.length < 6) {
  console.log("Usage: " + __filename + " <court code> <case number> <docket seq no> <part number>");
  process.exit(-1);
}

const court      = process.argv[2];
const caseNumber = process.argv[3];
const docketSeq  = process.argv[4];
const partNo     = process.argv[5];

// initialize auth headers
auth.init();

const caseApi = new CourtApi.CaseApi();

caseApi.getDocketDocument(court, caseNumber, docketSeq, partNo,
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
