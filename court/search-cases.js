#!/usr/bin/env node
//
// Search for a court case in PACER and import it into CourtAPI
//

const CourtApi = require('court_api');
const handlers = require('../inc/handlers');
const auth     = require('../inc/auth');

if (process.argv.length < 4) {
  console.error("Usage: " + __filename + " <court> <case number>");
  process.exit(-1);
}

const court      = process.argv[2];
const caseNumber = process.argv[3];

// initialize auth headers
auth.init();

const caseApi = new CourtApi.PacerCaseLookupApi();

const search = {
  openCases: true,
  caseNo: caseNumber
};

caseApi.searchCourtCases(court, search, (error, data, response) => {
  if (error) return handlers.errorHandler(error);

  console.log(JSON.stringify(response.body, null, 2));
});
