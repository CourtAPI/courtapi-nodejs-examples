#!/usr/bin/env node
//
// Get details about a specific court
//
// usage: show-court.js courtcode
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

if (process.argv.length < 3) {
  console.log("Usage: " + __filename + " courtcode");
  process.exit(-1);
}

const court = process.argv[2];

// initialize auth headers
auth.init();

const courtApi = new CourtApi.CourtsApi();

// show all test courts
courtApi.getCourtDetails(court, (error, data, response) => {
  if (error) return handlers.errorHandler(error);

  console.log(JSON.stringify(response.body, null, 2));
});
