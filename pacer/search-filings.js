#!/usr/bin/env node
//
// Example to search for a court
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

if (process.argv.length < 3) {
  console.error("Usage: " + __filename + " <case_uuid>");
  process.exit(-1);
}

const case_uuid = process.argv[2];

// initialize auth headers
auth.init();

const courtApi = new CourtApi.SearchApi();

courtApi.searchFilings(case_uuid,
    (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log(JSON.stringify(response.body, null, 2));
  }
);
