#!/usr/bin/env node

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

const pacerApi = new CourtApi.PacerCredentialsApi();

// setup authentication headers in the client
auth.init();

// Retrieve PACER Credentials
pacerApi.getCredentials(
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    console.log("App ID: " + response.body.app_id);
    console.log("PACER User: " + response.body.pacer_user);
  }
);
