#!/usr/bin/env node
//
// Delete stored PACER credentials
//

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

auth.init();

var pacerApi = new CourtApi.PacerCredentialsApi();

pacerApi.deleteCredentials(
  function (error, data, response) {
    if (error)
      return handlers.errorHandler(error);

    // { app_id: '...', pacer_user: '[your-pacer-username]', status: 'deleted' }
    console.log(response.body);
  }
);
