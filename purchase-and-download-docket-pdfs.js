#!/usr/bin/env node
//
// Complex Node example that:
// - Imports a case from PACER if necessary
// - Updates the dockets from PACER
// - Searches for docket entries that match a keyword
// - Purchases and downloads all PDFS for matched docket entries.
//
// Usage: purchase-and-downloadd-docket-pdfs.js <court code> <case number> <keyword>
//

'use strict';

const CourtApi  = require('court_api');
const fs        = require('fs');
const merge     = require('merge');
const base64    = require('base-64');
const auth      = require('./inc/auth');
const constants = require('./inc/constants');
const handlers  = require('./inc/handlers');

global.fetch = require('node-fetch');

//
// Fetch case information from CourtAPI
//
function getCase(court, caseNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getCaseMenu(court, caseNumber, handlers.promiseCallback(resolve, reject));
  });
}

//
// Get a docket entries page
//
function getDocketEntriesPage(court, caseNumber, search, page) {
  const caseApi = new CourtApi.CaseApi();

  const options = merge(search, {
    pageNumber: page,
    pageSize:  500,
    sortOrder: "desc"
  });

  return new Promise((resolve, reject) => {
    caseApi.getDockets(court, caseNumber, options, handlers.promiseCallback(resolve, reject));
  });
}

//
// Search for a case in PACER and import into CourtAPI
//
function pacerSearchCase(court, caseNumber) {
  const pacerCaseApi = new CourtApi.PacerCaseLookupApi();

  const search = {
    caseNo: caseNumber
  };

  return new Promise((resolve, reject) => {
    pacerCaseApi.searchCourtCases(court, search, handlers.promiseCallback(resolve, reject));
  });
}

//
// Update case docket entries for a case from PACER
//
function updateDockets(court, caseNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.updateDockets(court, caseNumber, null, handlers.promiseCallback(resolve, reject));
  });
}

//
// Get a case from CourtAPI, importing it from PACER if required
//
function importCase(court, caseNumber) {
  return new Promise(async (resolve, reject) => {
    var caseInfo;

    try {
      caseInfo = await getCase(court, caseNumber);
    }
    catch (e) {
      // if error indicates case is not in CourtAPI, look it up in PACER
      if (typeof e.error === 'string' && e.error.indexOf("No Matching Case") !== -1) {
        await pacerSearchCase(court, caseNumber);
        caseInfo = await getCase(court, caseNumber);
      }
      else {
        return reject(e);
      }
    }

    resolve(caseInfo);
  });
}

//
// purchases a docket document from PACER
//
function buyDocument(court, caseNumber, docketSeq, partNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.buyDocketDocument(court, caseNumber, docketSeq, partNumber,

      handlers.promiseCallback(resolve, reject)
    );
  });
}

//
// Get a docket document from local cache
//
function getDocument(court, caseNumber, docketSeq, docNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getDocketDocument(court, caseNumber, docketSeq, docNumber,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

async function processDocketEntry(court, caseNumber, docketEntry) {
  const docketSeq = docketEntry.docket_seq;
  const documents = docketEntry.binder.documents;

  for (var doc of documents) {
    // Buy the document part if necessary
    if (doc.filename === null)
      // Purchase the doucment from PACER
      doc = await buyDocument(court, caseNumber, docketSeq, doc.number);
    else
      // Download the PDF from CourtAPI
      doc = await getDocument(court, caseNumber, docketSeq, doc.number);

    await downloadFile(doc.document.download_url, doc.document.friendly_name);
  }
}

//
// Download a document and save it to a filename.
//
async function downloadFile(url, filename) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": 'Basic ' + base64.encode(constants.API_KEY + ':' + constants.API_SECRET)
    }
  });

  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(filename);

    res.body.pipe(dest);

    res.body.on('error', (err) => { reject(err) });
    dest.on('error', (err) => { reject(err) });
    dest.on('finish', () => { resolve() });
  });
}

//
// Search for docket entries matching a keyword, downloading all files in
// matched docket entries
//
async function processDocketEntries(court, caseNumber, keyword) {
  let page = 1;
  let totalPages = 0;

  const search = {
    searchKeyword: keyword,
    includeDocuments: true
  };

  // fetch all matched docket entries
  do {
    const dockets = await getDocketEntriesPage(court, caseNumber, search, page);

    // set totalPages if necessary
    if (totalPages === 0)
      totalPages = dockets.entries.total_pages;

    // process each docket entry
    for (const entry of dockets.entries.content) {
      try {
        await processDocketEntry(court, caseNumber, entry);
      }
      catch (e) {
        if (e.errorMessage !== undefined)
          console.error(e.errorMessage);
        else
          console.error(e);
      }
    }

    page = page + 1;
  } while (page < totalPages);
}

async function main() {
  if (process.argv.length < 5) {
    console.error("Usage: " + __filename + " <court code> <case number> <search keyword>");
    process.exit(-1);
  }

  const court         = process.argv[2];
  const caseNumber    = process.argv[3];
  const searchKeyword = process.argv[4];

  // initialize CourtAPI authentication
  auth.init();

  // Fetch the case information, importing it if necessary
  await importCase(court, caseNumber);

  // Update dockets
  await updateDockets(court, caseNumber);

  // Process docket entries
  await processDocketEntries(court, caseNumber, searchKeyword);

  return;
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error("An Error Ocurred:");
  console.error(err);
  process.exit(-1);
});

main()
  .then(() => console.log("done."))
  .catch((e) => console.error(e));
