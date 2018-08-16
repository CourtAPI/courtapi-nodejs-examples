#!/usr/bin/env node
//
// Display details about a specific case in CourtAPI
//

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

if (process.argv.length < 4) {
  console.log("Usage: " + __filename + " <court code> <case number>");
  process.exit(-1);
}

var court      = process.argv[2];
var caseNumber = process.argv[3];

// initialize auth headers
auth.init();

var caseApi = new CourtApi.CaseApi();

caseApi.getCaseMenu(court, caseNumber, function (error, data, response) {
  if (error)
    return handlers.errorHandler(error);

  console.log(JSON.stringify(response.body, null, 2));
});
