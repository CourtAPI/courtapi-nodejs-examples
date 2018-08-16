#!/usr/bin/env node
//
// Search for a court case in PACER and import it into CourtAPI
//

var CourtApi = require('court_api');
var handlers = require('../inc/handlers');
var auth     = require('../inc/auth');

if (process.argv.length < 4) {
  console.error("Usage: " + __filename + " <court> <case number>");
  process.exit(-1);
}

var court      = process.argv[2];
var caseNumber = process.argv[3];

// initialize auth headers
auth.init();

var caseApi = new CourtApi.PacerCaseLookupApi();

var search = {
  openCases: true,
  caseNo: caseNumber
};

caseApi.searchCourtCases(court, search, function (error, data, response) {
  if (error)
    return handlers.errorHandler(error);

  console.log(JSON.stringify(response.body, null, 2));
});
