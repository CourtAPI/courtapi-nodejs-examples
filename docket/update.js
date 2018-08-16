#!/usr/bin/env node
//
// Purchase the docket sheet for a case from PACER and import it into CourtAPI
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

const options = { };

const queryApi = new CourtApi.QueryApi();

queryApi.updateDockets(court, caseNumber, options,
  (error, data, response) => {
    if (error)
      return handlers.errorHandler(error);

    console.log("Case docket updated.");
    console.log(JSON.stringify(response.body, null, 2));
  }
);
