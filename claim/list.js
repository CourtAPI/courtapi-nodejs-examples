#!/usr/bin/env node
//
// List claim register entries for a case
//

const CourtApi = require('court_api');
const handlers = require('../inc/handlers');
const auth     = require('../inc/auth');

if (process.argv.length < 4) {
  console.log("Usage: " + __filename + " <court code> <case number>");
  process.exit(-1);
}

const court      = process.argv[2];
const caseNumber = process.argv[3];

// initialize auth headers
auth.init();


function getClaimsPage(court, caseNumber, options, page) {
  options.page = page;

  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getClaims(court, caseNumber, options,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

async function main() {

  let docketOptions = {
    //searchKeyword: 'bloomingdales',   // only show entries that contain a keyword
    pageSize: 50,       // number of docket entries to show per page
    sortOrder: "desc",  // Show the most recent items first
  };

  let page       = 0;
  let totalPages = 0;

  do {
    page = page + 1;

    const response = await getClaimsPage(court, caseNumber, docketOptions, page);

    if (response.entries.total_items == 0) {
      console.log("No docket entries - No matches, or PACER update needed");
      return;
    }

    // if this is the first page, initialize totalPages
    if (totalPages === 0)
      totalPages = response.entries.total_pages;

    console.log("-- PAGE " + page + "/" + totalPages + " --");

    for (const entry of response.entries.content)
      console.log(JSON.stringify(entry, null, 2));
  } while (page < totalPages);
}

main()
  .then()
  .catch(e => console.error(e));
