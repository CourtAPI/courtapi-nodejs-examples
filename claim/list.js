#!/usr/bin/env node
//
// List claim register entries for a case
//

var CourtApi = require('court_api');
var handlers = require('../inc/handlers');
var auth     = require('../inc/auth');

if (process.argv.length < 4) {
  console.log("Usage: " + __filename + " <court code> <case number>");
  process.exit(-1);
}

var court      = process.argv[2];
var caseNumber = process.argv[3];

// initialize auth headers
auth.init();

var docketOptions = {
  //searchKeyword: 'bloomingdales',   // only show entries that contain a keyword
  pageSize: 10,         // number of docket entries to show per page
  page: 1,              // page number to show
  sortOrder: "desc",     // Show the most recent items first
};

var caseApi = new CourtApi.CaseApi();
let totalPages = 0;

do {
  caseApi.getClaims(court, caseNumber, docketOptions,
    function (error, data, response) {
      if (error)
        return handlers.errorHandler(error);

      if (response.body.entries.total_items == 0) {
        console.log("No docket entries - No matches, or PACER update needed");
        return;
      }

      // if this is the first page, initialize totalPages
      if (totalPages === 0)
        totalPages = response.body.total_pages;

      console.log(JSON.stringify(response.body, null, 2));
    }
  );
} while (docketOptions.page < totalPages);
