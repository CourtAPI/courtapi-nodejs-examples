#!/usr/bin/env node
//
// Example to search for a court
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

// initialize auth headers
auth.init();

const courtApi = new CourtApi.CourtsApi();

const search = {
  test: true,
  type: 'bankruptcy'
};

// show all test courts
courtApi.getCourts(search, (error, data, response) => {
  if (error) return handlers.errorHandler(error);

  for (const court of response.body.courts) {
    console.log(JSON.stringify(court, null, 2));
  }
});
