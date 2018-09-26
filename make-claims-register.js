#!/usr/bin/env node
// Create an HTML file that contains the claims register sheet for a case.
//
// This will purchase the claims register from PACER if it is not already in CourtAPI 
//
// Usage: node make-claims-register.js <court code> <case number> [<output-file>]
//
// output-file defaults to 'claims-register.html'
//
'use strict';

const CourtApi     = require('court_api');
const Handlebars   = require('handlebars/runtime');
const fs           = require('fs');
const auth         = require('./inc/auth');
const handlers     = require('./inc/handlers');
const dateFormat   = require('dateformat');
const formatNumber = require('format-number');

const numberFormat = formatNumber();

// load pre-compiled handlebars templates
require('./templates');

//
// Get case information from CourtAPI
//
function getCase(court, caseNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getCaseMenu(court, caseNumber, handlers.promiseCallback(resolve, reject));
  });
}

//
// search for a case in PACER, importing into CourtAPI
//
function pacerSearchCase(court, caseNumber) {
  const pacerCaseApi = new CourtApi.PacerCaseLookupApi();

  let search = {
    caseNo: caseNumber
  };

  return new Promise((resolve, reject) => {
    pacerCaseApi.searchCourtCases(court, search, handlers.promiseCallback(resolve, reject));
  });
}

//
// Update the claims register for a case from PACER
//
function updateClaims(court, caseNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.updateClaims(court, caseNumber, {}, handlers.promiseCallback(resolve, reject));
  });
}

//
// Get case information from CourtAPI, updating from PACER if necessary
//
async function getCaseInfo(court, caseNumber) {
  try {
    return await getCase(court, caseNumber);
  }
  catch (e) {
    // if error indicates case is not in CourtAPI, look it up in PACER
    if (e.error !== undefined && e.error.indexOf("No Matching Case") !== -1) {
      await pacerSearchCase(court, caseNumber);
      return await getCase(court, caseNumber);
    }
    else {
      throw e;
    }
  }
}

//
// Get the claims register header from CourtAPI
//
function getClaimsHeader(court, caseNumber) {
  var caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getClaimsHeader(court, caseNumber, handlers.promiseCallback(resolve, reject));
  });
}

//
// write the beginning of the case page to the output stream
//
async function writeCaseHeader(stream, court, caseNumber) {
  const caseInfo = await getCaseInfo(court, caseNumber);

  const header = Handlebars.templates['header'];

  stream.write(header(caseInfo.case));
}

//
// Write the claims register header to the output stream
//
async function writeClaimsHeader(stream, court, caseNumber) {
  let claimsHeader = await getClaimsHeader(court, caseNumber);

  // if the claims register has not been imported, a bunch of fields are null.
  // I'm not sure if this is the best way to know if it hasn't been updated or
  // not, but this is one way.
  if (claimsHeader.header.html === null) {
    await updateClaims(court, caseNumber);
    claimsHeader = await getClaimsHeader(court, caseNumber);
  }

  if (claimsHeader.header.html !== undefined) {
    stream.write(
      "<div class='container'>" +
        claimsHeader.header.html +
      "</div>"
    );
  }
}

//
// Get a page of claims entries from CourtAPI
//
async function getClaimsEntriesPage(court, caseNumber, page) {
  const caseApi = new CourtApi.CaseApi();

  let options = {
    pageNumber: page,
    pageSize:  500,
    sortOrder: 'desc',
    // you can restrict by keyword with something like this:
    //searchKeyword: "Sprint Solutions"
  };

  return new Promise((resolve, reject) => {
    caseApi.getClaims(court, caseNumber, options, handlers.promiseCallback(resolve, reject));
  });
}

//
// Write all matched claims entries to the output stream
//
async function writeClaimsEntries(stream, court, caseNumber) {
  const claimTemplate = Handlebars.templates['claims-entry'];

  let page = 1;
  let totalPages = 0;

  // fetch all of the docket entries pages and append docket entries to HTML
  do {
    const claims = await getClaimsEntriesPage(court, caseNumber, page);

    if (totalPages === 0) {
      // this is the first page, update the total page
      totalPages = claims.entries.total_pages;

      // and if we have at least one entry, add a headings row
      if (claims.entries.content.length > 0) {
        stream.write(
          claimTemplate({
            claimNumber: '#',
            dateFiled:   'Original File Date',
            creditor:    'Creditor',
            amount:      'Total Amount Claimed',
            lastUpdated: 'Last Updated',
            rowClass:    'font-weight-bold'
          })
        );
      }
    }

    claims.entries.content.forEach((entry) => {
      stream.write(
        claimTemplate({
          claimNumber: entry.info.claim_no,
          dateFiled:   entry.info.original_filed_date,
          creditor:    entry.creditor,
          amount:      '$' + numberFormat(entry.amounts.amount.claimed),
          lastUpdated: dateFormat(new Date(entry.info.modified), 'mm/dd/yyyy'),
        })
      );
    });

    page = page + 1;
  } while (page < totalPages);
}

async function main() {
  auth.init();

  if (process.argv.length < 4) {
    console.error('Usage: ' + __filename + ' <court> <case number> [<output filename>]');
    process.exit(-1);
  }

  const court      = process.argv[2];
  const caseNumber = process.argv[3];
  let outFileName  = process.argv[4];

  if (outFileName === undefined)
    outFileName = 'claims-register.html';

  // open the output file stream
  const outStream = fs.createWriteStream(outFileName);

  await writeCaseHeader(outStream, court, caseNumber);

  await writeClaimsHeader(outStream, court, caseNumber);

  // now write the claims entries list
  outStream.write("<ul class='list-group'>");
  await writeClaimsEntries(outStream, court, caseNumber);
  outStream.write(
    "</ul>" +
    "</div>" +
    "</body>" +
    "</html>"
  );

  outStream.end();

  return outFileName;
}

main()
  .then((filename) => console.log('Saved claims register as ' + filename))
  .catch((e) => console.error(e));
