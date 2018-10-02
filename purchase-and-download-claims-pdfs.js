#!/usr/bin/env node
//
// Complex Node example that:
// - Imports a case from PACER if necessary
// - Updates the claims register from PACER
// - Searches for claims register entries that match a keyword
// - Purchases and downloads all PDFS for matched claims entries.
//
// Usage: purchase-and-download-claims-pdfs.js <court code> <case number> <keyword>
//

'use strict';

const CourtApi = require('court_api');
const base64   = require('base-64');
const fs       = require('fs');
const merge    = require('merge');

const auth      = require('./inc/auth');
const constants = require('./inc/constants');
const handlers  = require('./inc/handlers');

global.fetch = require('node-fetch');

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
// Fetch case information from CourtAPI
//
function getCase(court, caseNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getCaseMenu(court, caseNumber, handlers.promiseCallback(resolve, reject));
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
// Get a claims entries page from CourtAPI
//
function getClaimsEntriesPage(court, caseNumber, search, page) {
  const caseApi = new CourtApi.CaseApi();

  const options = merge(search, {
    pageNumber: page,
    pageSize:  500,
    sortOrder: "desc"
  });

  return new Promise((resolve, reject) => {
    caseApi.getClaims(court, caseNumber, options, handlers.promiseCallback(resolve, reject));
  });
}

//
// Update claims entries for a case from PACER
//
function updateClaims(court, caseNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.updateClaims(court, caseNumber, null, handlers.promiseCallback(resolve, reject));
  });
}

//
// Search for claims entries matching a keyword, downloading all files in
// matched claims entries
//
async function findAndProcessClaims(court, caseNumber, keyword) {
  let page = 1;
  let totalPages = 0;

  const search = {
    searchKeyword: keyword,
    includeDocuments: true
  };

  // fetch all matched claims entries
  // There may be multiple pages of responses from CourtAPI, so loop to fetch
  // all pages.
  do {
    const claims = await getClaimsEntriesPage(court, caseNumber, search, page);

    // set totalPages if necessary
    if (totalPages === 0)
      totalPages = claims.entries.total_pages;

    // process each claims entry
    for (const entry of claims.entries.content) {
      try {
        await processClaimsEntry(court, caseNumber, entry);
      }
      catch (e) {
        console.error(e);
      }
    }

    page = page + 1;
  } while (page < totalPages);
}

//
// Get claim document JSON.  If document is not in CourtAPI, several fields
// (such as filename) will be null
//
function getDocument(court, caseNumber, claimNumber, claimSequence, docNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getClaimDocument(
      court, caseNumber, claimNumber, claimSequence, docNumber,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

//
// Purchase a Claim PDF from PACER, returns Claim document JSON
//
function buyDocument(court, caseNumber, claimNumber, claimSequence, docNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.buyClaimDocument(
      court, caseNumber, claimNumber, claimSequence, docNumber,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

//
// Download a document and save it to a filename.
//
async function downloadFile(url, filename) {
  console.log("Downloading file: " + filename);

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

async function processClaimsEntry(court, caseNumber, claimsEntry) {
  const claimNo = claimsEntry.info.claim_no;

  for (const histItem of claimsEntry.history) {
    // skip if this entry does not have a binder
    if (typeof histItem.binder === 'undefined')
      return;

    const claimSeq  = histItem.claim_seq.replace(/^[0-9]+-/, '');

    for (var doc of histItem.binder.documents) {
      if (doc.filename === null)
        doc = await buyDocument(court, caseNumber, claimNo, claimSeq, doc.number);
      else
        doc = await getDocument(court, caseNumber, claimNo, claimSeq, doc.number);

      await downloadFile(doc.document.download_url, doc.document.friendly_name);
    }
  }
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
  console.log("case imported");

  // Update claims
  await updateClaims(court, caseNumber);
  console.log("claims imported");

  // Process claims entries
  await findAndProcessClaims(court, caseNumber, searchKeyword);

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
