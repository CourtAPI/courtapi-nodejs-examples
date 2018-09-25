#!/usr/bin/env node
//
// List the docket entries for a case on CourtAPI
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

const caseApi = new CourtApi.CaseApi();

let totalPages = 0;
let page       = 0;

async function getDocketPage(court, caseNumber, page) {
  const options = {
    page: page,
    pageSize: 50,          // number of docket entries to show per page
    sortOrder: "desc",     // Show the most recent items first
    // search for entries containing a search string
    // searchKeyword: 'order entered'
  };

  return new Promise((resolve, reject) => {
    caseApi.getDockets(court, caseNumber, options, handlers.promiseCallback(resolve, reject))
  });
}

async function main() {
  let page = 0;
  let totalPages = 0;

  do {
    page = page + 1;

    const response = await getDocketPage(court, caseNumber, page);

    if (response.entries.total_items == 0) {
      console.log("No docket entries - purchase docket sheet from PACER");
      return;
    }

    // if this is the first page, initialize totalPages
    if (totalPages === 0)
      totalPages = response.entries.total_pages;

    console.log("// -- PAGE " + page + "/" + totalPages + " --");

    console.log(JSON.stringify(response, null, 2));
  } while (page < totalPages);
}

main()
  .then()
  .catch((e) => console.error(e));
