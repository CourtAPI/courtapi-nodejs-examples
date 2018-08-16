#!/usr/bin/env node
//
// Display details about a specific case in CourtAPI
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

if (process.argv.length < 4) {
  console.log("Usage: " + __filename + " <court code> <case number>");
  process.exit(-1);
}

const court      = process.argv[2];
const caseNumber = process.argv[3];

// initialize auth headers
auth.init();

const caseApi = new CourtApi.CaseApi();

caseApi.getCaseMenu(court, caseNumber, (error, data, response) => {
  if (error) return handlers.errorHandler(error);

  console.log(JSON.stringify(response.body, null, 2));
});
