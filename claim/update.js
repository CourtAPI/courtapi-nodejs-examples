#!/usr/bin/env node
//
// Purchase and import the claims register for a case into CourtAPI from PACER
//

const CourtApi = require('court_api');
const handlers = require('../inc/handlers');
const auth     = require('../inc/auth');

if (process.argv.length < 4) {
  console.log("Usage: " + __filename + " <court code> <case number>");
  process.exit(-1);
}

const court      = process.argv[2];
const caseNumber = process.argv[3];

// initialize auth headers
auth.init();

const queryApi = new CourtApi.QueryApi();

queryApi.updateClaims(court, caseNumber, null,
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
