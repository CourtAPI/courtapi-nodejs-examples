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

const fs       = require('fs');
const CourtApi = require('court_api');
const merge    = require('merge');
const auth     = require('./inc/auth');
const handlers = require('./inc/handlers');

global.fetch = require('node-fetch');

//
// Helper function to determine if an object is empty
//
function isEmptyObject (obj) {
  for (var item in obj)
    return false;

  return true;
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
    pageSize:  50,
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
    searchKeyword: keyword
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

function updateClaimParts(court, caseNumber, claimNumber, claimSequence) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.updateClaimParts(
      court, caseNumber, claimNumber, claimSequence,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

function getClaimParts(court, caseNumber, claimNumber, claimSequence) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getClaimParts(court, caseNumber, claimNumber, claimSequence,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

//
// Get claim document JSON.  If document is not in CourtAPI, several fields
// (such as filename) will be null
//
function getClaimDocument(court, caseNumber, claimNumber, claimSequence, docNumber) {
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
function buyClaimDocument(court, caseNumber, claimNumber, claimSequence, docNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.buyClaimDocument(
      court, caseNumber, claimNumber, claimSequence, docNumber,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

//
// Purchases a document part if necessary
//
function purchaseDocumentPart(court, caseNumber, claimNumber, claimSequence, docPart) {
  const docNumber = docPart.number;

  return new Promise(async (resolve, reject) => {
    if (docPart.filename == null)
      // Document not in CourtAPI, purchase from PACER
      docPart = await buyClaimDocument(court, caseNumber, claimNumber, claimSequence, docNumber);
    else
      // Document is already in CourtAPI, just return it
      docPart = await getClaimDocument(court, caseNumber, claimNumber, claimSequence, docNumber);

    resolve(docPart);
  });
}

//
// Download a document and save it to a filename.
//
async function downloadFile(url, filename) {
  console.log("Downloading file: " + filename);

  const res = await fetch(url);

  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(filename);

    res.body.pipe(dest);

    res.body.on('error', (err) => { reject(err) });
    dest.on('error', (err) => { reject(err) });
    dest.on('finish', () => { resolve() });
  });
}

async function processClaimsEntry(court, caseNumber, claimsEntry) {
  const claimNumber = claimsEntry.info.claim_no;

  for (const claimPart of claimsEntry.history) {
    // CourtAPI gives the sequence as claimNumber-claimSeq
    // Strip off claimNumber
    const claimSequence = claimPart.claim_seq.replace(/^[0-9]+-/, '');

    let docs = await getClaimParts(court, caseNumber, claimNumber, claimSequence);

    // if parts is emtpy, update from PACER
    if (docs.parts.length == 0)
      docs = await updateClaimParts(court, caseNumber, claimNumber, claimSequence);

    // For each document part, buy the PDF if necessary, and download it
    for (var docPart of docs.parts) {
      docPart = await purchaseDocumentPart(court, caseNumber, claimNumber, claimSequence, docPart);

      const url      = docPart.part.download_url;
      const fileName = docPart.part.filename;

      if (url !== null && fileName !== null)
        await downloadFile(url, fileName);
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

  // Update claims
  await updateClaims(court, caseNumber);

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
