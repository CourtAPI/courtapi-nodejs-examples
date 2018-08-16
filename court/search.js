#!/usr/bin/env node
//
// Example to search for a court
//

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

// initialize auth headers
auth.init();

var courtApi = new CourtApi.CourtsApi();

var search = {
  test: true,
  type: 'bankruptcy'
};

// show all test courts
courtApi.getCourts(search, function (error, data, response) {
  if (error)
    return handlers.errorHandler(error);

  response.body.courts.forEach(function(court) {
    console.log(JSON.stringify(court, null, 2));
  });
});
