#!/usr/bin/env node
// Create an HTML file that contains the docket sheet for a case.
//
// This will purchase the docket sheet from PACER if the docket sheet is not already in CourtAPI 
//
// Usage: node make-docket-sheet.js <court code> <case number> [<output-file>]
//
// output-file defaults to 'docket-sheet.html'
//
'use strict';

const CourtApi   = require('court_api');
const Handlebars = require('handlebars/runtime');
const fs         = require('fs');
const auth       = require('./inc/auth');
const handlers   = require('./inc/handlers');

// load pre-compiled handlebars templates
require('./templates');

//
// Get the case menu from CourtAPI
//
function getCase(court, caseNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getCaseMenu(court, caseNumber, handlers.promiseCallback(resolve, reject));
  });
}

//
// Get the docket header
//
function getDocketHeader(court, caseNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getDocketHeader(court, caseNumber, handlers.promiseCallback(resolve, reject));
  });
}

//
// Search for a case in PACER
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
// Update the case docket entries from PACER
//
function updateDockets(court, caseNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.updateDockets(court, caseNumber, null, handlers.promiseCallback(resolve, reject));
  });
}

//
// Retrieve the case menu information from CourtAPI, importing from PACER if necessary
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
// Fetch a page of docket entries from CourtAPI.
//
function getDocketEntriesPage(court, caseNumber, page) {
  const caseApi = new CourtApi.CaseApi();

  let options = {
    pageNumber: page,
    pageSize:  500,
    sortOrder: 'desc',
    //searchKeyword: "Sprint Solutions"
  };

  return new Promise((resolve, reject) => {
    caseApi.getDockets(court, caseNumber, options, handlers.promiseCallback(resolve, reject));
  });
}

//
// Write the case header to the output stream
//
async function writeCaseHeader(stream, court, caseNumber) {
  const caseInfo = await getCaseInfo(court, caseNumber);

  // create the docket header html
  const header   = Handlebars.templates['header'];

  stream.write(header(caseInfo.case));
}

//
// Write the docket header information to the output stream
//
async function writeDocketHeader(stream, court, caseNumber) {
  let docketHeader = await getDocketHeader(court, caseNumber);

  // if the docket has not been imported, a bunch of fields are null.  I'm not
  // sure if this is the best way to know if it hasn't been updated or not, but
  // this is one way.
  if (docketHeader.header.html === null) {
    await updateDockets(court, caseNumber);
    docketHeader = await getDocketHeader(court, caseNumber);
  }

  if (docketHeader.header.html !== undefined) {
    stream.write(
      "<div class='container'>" +
        docketHeader.header.html +
      "</div>"
    );
  }
}

//
// Write all matched docket entries to the output stream
//
async function writeDocketEntries(stream, court, caseNumber) {
  const docketTemplate = Handlebars.templates['docket-entry'];

  let page = 1;
  let totalPages = 0;

  // fetch all of the docket entries pages and append docket entries to HTML
  // Results are paginated, so we loop over all pages in the results.
  do {
    const docketResponse = await getDocketEntriesPage(court, caseNumber, page);

    if (totalPages === 0) {
      // this is the first page, update the total page
      totalPages = docketResponse.entries.total_pages;

      // and if we have at least one entry, add a headings row
      if (docketResponse.entries.content.length > 0) {
        stream.write(
          docketTemplate({
            date_filed: 'Date Filed',
            docket_no: '#',
            docket_text: 'Docket Text',
            rowclass: 'font-weight-bold'
          })
        );
      }
    }

    docketResponse.entries.content.forEach((entry) => {
      stream.write(docketTemplate(entry));
    });

    page = page + 1;
  } while (page < totalPages);
}

async function main() {
  auth.init();

  if (process.argv.length < 4) {
    console.error('Usage: ' + __filename + ' <court> <case number> [<filename>]');
    process.exit(-1);
  }

  const court      = process.argv[2];
  const caseNumber = process.argv[3];
  let outFileName  = process.argv[4];

  if (outFileName === undefined)
    outFileName = 'docket-sheet.html';

  // open the output file stream
  const outStream = fs.createWriteStream(outFileName);

  // write the page header for the case
  await writeCaseHeader(outStream, court, caseNumber);

  // write the docket header
  await writeDocketHeader(outStream, court, caseNumber);

  // now write the docket entries list
  outStream.write("<ul class='list-group'>");

  await writeDocketEntries(outStream, court, caseNumber);

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
  .then((filename) => console.log('Saved docket sheet as ' + filename))
  .catch((e) => console.error(e));
