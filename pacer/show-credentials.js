#!/usr/bin/env node

var CourtApi = require('court_api');
var auth     = require('../inc/auth');
var handlers = require('../inc/handlers');

var pacerApi = new CourtApi.PacerCredentialsApi();

// setup authentication headers in the client
auth.init();

// Retrieve PACER Credentials
pacerApi.getCredentials(
    function( error, data, response ) {
      if (error)
        return handlers.errorHandler(error);

      console.log("App ID: " + response.body.app_id);
      console.log("PACER User: " + response.body.pacer_user);
    }
);
