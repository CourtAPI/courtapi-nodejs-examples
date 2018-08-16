#!/usr/bin/env node
//
// Get details about a specific court
//
// usage: show-court.js courtcode
//

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

if (process.argv.length < 3) {
  console.log("Usage: " + __filename + " courtcode");
  process.exit(-1);
}

// initialize auth headers
auth.init();

var courtApi = new CourtApi.CourtsApi();

// show all test courts
courtApi.getCourtDetails(process.argv[2], function (error, data, response) {
  if (error)
    return handlers.errorHandler(error);

  console.log(JSON.stringify(response.body, null, 2));
});
