#!/usr/bin/env node
//
// Delete stored PACER credentials
//

const CourtApi = require('court_api');
const auth     = require('../inc/auth');
const handlers = require('../inc/handlers');

auth.init();

const pacerApi = new CourtApi.PacerCredentialsApi();

pacerApi.deleteCredentials(
  (error, data, response) => {
    if (error) return handlers.errorHandler(error);

    // { app_id: '...', pacer_user: '[your-pacer-username]', status: 'deleted' }
    console.log(response.body);
  }
);
