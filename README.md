# JavaScript (nodejs) based CourtAPI Examples

This directory contains a set of nodeJS scripts demonstrating how to accomplish:

- Locate a case in CourtAPI
- Purchase and display the docket sheet
- Purchase and display the claims register
- Download PDFs from the docket sheet and/or claims register

## Prerequisites

- NodeJS version 8.x or later.
- npm
- yarn (`npm install -g yarn`)
- make

## Client Library

The `court_api` client library needs to be installed.  This library is
available at https://github.com/CourtAPI/courtapi-javascript-client

```shell
  git clone https://github.com/CourtAPI/courtapi-javascript-client
  cd courtapi-javascript-client
  npm install
  npm link
```
## Install Node Pacakges

In this directory, install the prerequisites, and link the `court_api` library:

```shell
  yarn install
  npm link court_api
```

## Configuration

Configuration is handled by environment variables.  At a minimum, you must set
your CourtAPI `APP_ID` and `SECRET`.

```shell
  $ export COURTAPI_APP_ID="your-app-id"
  $ export COURTAPI_SECRET="your-secret"
```

For local examples, using `courtapi.inforuptcy.dev.azk.io`, you can use
anything for these.  For the training or live sites, you must use your real
values.  The default is to use the local dev environment.

## JavaScript API Notes

All of the example code in this document assumes that you have initialized
the `court_api` client library.  To do this, you simply need to require the
library, and set up authentication.

E.g.:

```javascript
  const CourtApi = require('court_api');
```

An `auth.js` is provided in the `inc` directory that sets up the authentication
headers for you:

```javascript
  const auth = require('./inc/auth');
  auth.init();
```

All of the example scripts in this directory use this convention.

In addition, most of the endpoints take a callback function as their last
argument.  The callback signature looks like:

```javascript
  function callback(error, data, response) {
    if (error)
      // handle the error
    else
      // handle response
  }
```

Most of the example code in this document assumes you handled the error for
brevity.

A Node Promise style callback is included in `inc/handlers.js` that will
`resolve()` the response body content, and `reject()` the error content on
error.

E.g.:

```javascript
  return new Promise((resolve, reject) => {
    caseApi.getDockets(court, caseNumber, options, handlers.promiseCallback(resolve, reject))
  });
```

This is equivalent to:

```javascript
  return new Promise((resolve, reject) => {
    caseApi.getDockets(court, caseNumber, options,
      (error, data, response) => {
        if (error)
          reject(error.response.body);
        else
          resolve(response.body);
      }
    );
  });
```

## Manage your PACER credentials

Many operations require PACER credentials.  You need to save these in CourtAPI.
The following programs demonstrate this functionality:

These functions are exposed by the `PacerCredentialsApi'.

```javascript
  const pacerApi = new CourtApi.PacerCredentialsApi();
```

### Save PACER Credentials

Endpoint: `POST /pacer/credentials`

This endpoint saves your pacer username and password in CourtAPI.  This
endpoint is handled by the `saveCredentials()` method in
`PacerCredentialsApi`.

Sample Code:
```javascript
  const credentials = {
    pacerUser: '[your pacer username]',
    pacerPass: '[your pacer password]'
  };

  const pacerApi = new CourtApi.PacerCredentialsApi();

  pacerApi.saveCredentials(credentials,
    function (error, data, response) {
      console.log("Pacer credentials stored successfully")
    }
  );
```

Usage: `pacer/save-credentials.js <pacer username> <pacer password>`

Example Output:
```shell
  $ pacer/save-credentials.js dummy test
  Pacer credentials stored successfully
```

### Show PACER Credentials

Endpoint: `GET /pacer/credentials`

This endpoint retrieves the username of your saved PACER credentials.  This
method is handled by the `getCredentials()` method in the
`PacerCredentialsApi`.

Sample Code:
```javascript
  const pacerApi = new CourtApi.PacerCredentialsApi();

  pacerApi.getCredentials(
    function (error, data, response) {
      console.log("App Id: " + response.body.app_id);
      console.log("Pacer User: " + response.body.pacer_user);
    }
  );
```

Usage: `pacer/show-credentials.js`

Example:
```shell
  $ pacer/show-credentials.js test dummy
  App ID: [your app id]
  PACER User: test
```

### Delete PACER Credentials

Endpoint: `DELETE /pacer/credentials`

This endpoint deletes your saved PACER credentials from CourtAPI.  This method
is handled by the `deleteCredentials()` method of the
`PacerCredentialsApi`.

Sample Code:
```javascript
  const pacerApi = new CourtApi.PacerCredentialsApi();

  pacerApi.deleteCredentials(function (error, data, response) {
    console.log(response.body);
  });
```

Usage `pacer/delete-credentials.js'

Example:
```shell
  $ pacer/delete-credentials.js
  { app_id: '25ed3872', pacer_user: 'dummy', status: 'deleted' }
```

### Search for a Court

Endpoint: `GET /courts/pacer`

This endpoint can be used to list or search for courts in CourtAPI.  This is
handled by the `getCourts()` method in the `CourtsApi`.

This snippet displays all test bankruptcy courts.

Sample Code:
```javascript
  const courtApi = new CourtApi.CourtsApi();

  courtApi.getCourts(
    { test: true, type: 'bankruptcy' },
    function (error, data, response) {
      response.body.courts.forEach(function (court) {
        console.log(JSON.stringify(court, null, 2);
      });
    }
  );
```

Usage `court/search.js`

Example Output:
```shell
  $ search-courts.js
  {
    "code": "akbtest",
    "links": {
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/courts/pacer/akbtest"
      }
    },
    "name": "Alaska TEST Bankruptcy Court"
  }
  {
    "code": "akbtrain",
    "links": {
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/courts/pacer/akbtrain"
      }
    },
    "name": "Alaska TRAIN Bankruptcy Court"
  }
  ...
```

### Show a Specific Court

Endpoint: `GET /courts/pacer/{court}`

This endpoint shows the details about a specific court.  This is handled by the
`getCourtDetails()` method if the `CourtsApi`.

Sample Code:
```javascript
  const courtApi = new CourtApi.CourtsApi();

  courtApi.getCourtDetails("orbtrain", function (error, data, response) {
    console.log(JSON.stringify(response.body, null, 2));
  });
```

Usage: `court/show.js <court code>`

Example Output:
```shell
  $ court/show.js orbtrain
  {
    "abbr": "orbtrain",
    "citation": "Bankr.D.Or.TRAIN.",
    "links": {
      "cases_report_bk": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/courts/pacer/orbtrain/cases/report/bankruptcy"
      },
      "cases_search": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/courts/pacer/orbtrain/cases/search"
      }
    },
    "name": "Oregon TRAIN Bankruptcy Court",
    "subdomain": "ecf-train.orb.uscourts.gov",
    "timezone": null,
    "type": "bankruptcy"
  }
```

## Search for a Court Case

Once you have the court code (e.g.: `azbtest`), you can search for cases on
CourtAPI within that court, or, import a case from PACER.

### Show a Specific Court Case

Endpoint: `GET /cases/pacer/{court}/{case}`

This endpoint shows the details of a specific court case on CourtAPI.  This is
handled by the `getCaseMenu()` method in the `CaseApi`.

Sample Code:
```javascript
  caseApi.getCaseMenu(court, caseNumber, function (error, data, response) {
    console.log(JSON.stringify(response.body, null, 2));
  })
```

Usage: `court/show-case.js <court code> <case number>`

Example:
```shell
  $ court/show-case.js orbtrain 6:14-bk-63619
  ERROR: 400
  { error: 'No Matching Case Found for 6:14-bk-63619 at orbtrain' }
```

This indicates the case needs to be imported from PACER by doing a search:

```shell
  $ court/search.js orbtrain 6:14-bk-63619
```

And then re-run `court/show-case.js`

```shell
  $ court/show-case.js orbtrain 6:14-bk-63619
  {
    "case": {
      "appeal_case_uuid": null,
      "assets": "Unknown",
      "assigned_to": null,
      "case_chapter_id": 1,
      "case_court_id": 221,
      "case_id": 5083526,
      "case_id_external": 458895,
      "case_no": "6:14-bk-63618",
      "case_petition_id": 1,
      "case_title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "case_type_id": 1,
      "case_uuid": "orbtrain_458895",
      "cause": null,
      "ch11_type": null,
      "ch11_type_code": null,
      "chapter": 7,
      "citation": "Bankr.D.Or.TRAIN.",
      "court": "orbtrain",
      "court_name": "orbtrain",
      "created": "2018-07-31 22:46:26.405004+00",
      "date_closed": null,
      "date_discharged": null,
      "date_filed": "10/15/2014",
      "date_of_last_filing": "10/15/2014",
      "date_plan_confirmed": null,
      "date_terminated": null,
      "disabled": 0,
      "disposition": null,
      "has_asset": 0,
      "industry": null,
      "is_business_bankruptcy": null,
      "judge_name": null,
      "jurisdiction": null,
      "jury_demand": null,
      "lead_case_uuid": null,
      "liabilities": "Unknown",
      "modified": "2018-08-01 16:50:52.145018+00",
      "naics_code": null,
      "nature_of_debt": null,
      "nature_of_suit_code": null,
      "referred_to": null,
      "timestamp": 1533142252.14502,
      "title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "uri_id": 85055151,
      "website": null
    },
    "links": {
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63618"
      }
    }
  }
```

### Search Court Cases

Endpoint: `POST /courts/pacer/{court}/cases/search`

This endpoint has several options for searching, but the example script just
searches for a specific case number.  The method for this endpoint is
`searchCourtCases` from the `PacerCaseLookupApi`  See the CourtAPI
documentation for other search terms that could be used.

Sample Code:
```javascript
  const search = {
    openCases: true,
    caseNo: caseNumber
  };

  const caseApi = new CourtApi.PacerCaseLookupApi();

  caseApi.searchCourtCases(court, search, function (error, data, response) {
    console.log(JSON.stringify(response.body, null, 2));
  });
```

Usage: `court/search-cases.js <court code> <case number>

Example:
```shell
  $ court/search-cases.js orbtrain 6:14-bk-63618
  {
    "cases": [
      {
        "case_no": "6:14-bk-63618",
        "case_title": "Joseph Wayne Sample and Sarah Lynn Sample",
        "chapter": 7,
        "court_code": "orbtrain",
        "date_closed": null,
        "date_filed": "10/15/2014",
        "lead_bk_case_no": null,
        "lead_bk_case_title": null,
        "links": {
          "dockets": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63618/dockets"
          },
          "self": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63618"
          }
        },
        "timestamp": 1533142252.14502,
        "title": "Joseph Wayne Sample and Sarah Lynn Sample"
      }
    ],
    "parties": [],
    "receipts": []
  }
```

## Purchase and Display Case Docket Sheet

Next we can purchase the docket sheet and find docket entries we are interested
in and purchase documents for those entries.

### Show Docket Entries

Endpoint: `GET /cases/pacer/{court}/{case}/dockets`

This endpoint shows the docket entries for a case.  This is handled by the
`getDockets()` method in the `CaseApi`.

Sample Code:
```javascript
  const docketOptions = {
    pageSize: 10,         // number of docket entries to show per page
    page: 1,              // page number to show
    sortOrder: "desc",     // Show the most recent items first
    // search for entries containing a search string
    // searchKeyword: 'order entered'
  };

  caseApi.getDockets(court, caseNumber, docketOptions,
    function (error, data, response) {
      if (response.body.entries.total_items == 0) {
        console.log("No docket entries - purchase docket sheet from PACER");
        return;
      }

      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `docket/list.js <court> <case number>`

Example:
```shell
  $ docket/list.js orbtrain 6:14-bk-63619
  No docket entries - purchase docket sheet from PACER
```

This means we must use the `POST /cases/pacer/{court}/{case}/dockets/update` endpoint
to purchase the docket sheet.  (see next section).

For case where the docket is already in CourtAPI, the output looks like this:

```shell
  $ docket/list.js orbtrain 6:14-bk-63619
  {
    "entries": {
      "content": [
        {
          "annotations": [
            {
              "datetime": "2014-12-19",
              "highlight_phrase": "12/19/2014",
              "key_phrase": "Amended Order To Pay Filing Fees in Installments 1st Installment Payment due"
            },
            {
              "datetime": "2015-01-20",
              "highlight_phrase": "1/20/2015",
              "key_phrase": "FINAL Installment Payment due"
            }
          ],
          "case_uuid": "orbtrain_458907",
          "date_filed": "11/19/2014",
          "docket_no": 4,
          "docket_seq": "4.00000",
          "docket_text": "Amended Order To Pay Filing Fees in Installments 1st Installment Payment due by 12/19/2014. FINAL Installment Payment due by 1/20/2015. (jrp) (Entered: 11/19/2014)",
          "docket_uri": null,
          "links": {
            "documents": {
              "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000/documents"
            },
            "self": {
              "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000"
            }
          },
          "timestamp": 1533079112.11464
        },
        ...
      ],
      "links": {
        "self": {
          "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets?sort_order=desc&page_size=10&page_number=1"
        }
      },
      "page_size": "10",
      "total_items": 5,
      "total_pages": 1
    },
    "header": {
      "html": "...",
      "timestamp": 1533079112.0805
    },
    "links": {
      "header": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/header"
      },
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/update",
        "method": "POST"
      },
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets?sort_order=desc&page_size=10"
      }
    }
  }
```

### Purchase Docket Sheet

Endpoint `POST /cases/pacer/{court_code}/{case_number}/dockets/update`

This method updates the docket entries for a case from PACER.  This is handled
by the `updateDockets()` method in the `QueryApi`.

Sample Code:
```javascript
  const queryApi = new CourtApi.QueryApi();

  const options = {};

  queryApi.updateDockets(courtCode, caseNumber, options, callback);
```

Usage: `docket/update.js <court> <case number>`

Example:
```shell
  $ docket/update.js orbtrain 6:14-bk-63619
  Case docket updated.
  {
    "case": {
      "appeal_case_uuid": null,
      "assets": "Unknown",
      "assigned_to": " ",
      "case_chapter_id": 1,
      "case_court_id": 221,
      "case_id": 5083527,
      "case_id_external": 458907,
      "case_no": "6:14-bk-63619",
      "case_petition_id": 1,
      "case_title": "Somewhere Someone",
      "case_type_id": 1,
      "case_uuid": "orbtrain_458907",
      "cause": null,
      "ch11_type": null,
      "ch11_type_code": null,
      "chapter": 7,
      "court": "orbtrain",
      "court_name": "orbtrain",
      "created": "2018-07-31 22:57:56.468595+00",
      "date_closed": null,
      "date_discharged": null,
      "date_filed": "11/19/2014",
      "date_of_last_filing": null,
      "date_plan_confirmed": null,
      "date_terminated": null,
      "disabled": 0,
      "disposition": null,
      "has_asset": 0,
      "industry": null,
      "is_business_bankruptcy": 0,
      "judge_name": null,
      "jurisdiction": null,
      "jury_demand": null,
      "lead_case_uuid": null,
      "liabilities": "Unknown",
      "modified": "2018-08-01 19:40:08.356047+00",
      "naics_code": null,
      "nature_of_debt": null,
      "nature_of_suit_code": null,
      "ncl_parties": [],
      "referred_to": null,
      "schedule_ab": null,
      "timestamp": 1533152408.35605,
      "title": "Somewhere Someone",
      "uri_id": 85055152,
      "website": null
    },
    "forms": {
      "case_code": "6-14-bk-63619",
      "date_from": null,
      "date_to": null,
      "date_type": "filed",
      "doc_from": null,
      "doc_to": null,
      "show_terminated": 1
    },
    "items": {
      "docket_headers": [
        {
          "meta": {
            "case_uuid": "orbtrain_458907",
            "filename": "<filename_is_ignored>",
            "timestamp": 1533152406.84978
          },
          "text": "... [ html ] ..."
        }
      ],
      "dockets": [
        {
          "case_uuid": "orbtrain_458907",
          "date_filed": "11/19/2014",
          "docket_no": 0,
          "docket_seq": 0,
          "docket_text": "Commencement of Case. (jrp) (Entered: 11/19/2014)",
          "docket_uri": null,
          "filename": "orbtrain_458907_0_0",
          "timestamp": 1533152406.84978,
          "title": "Commencement of Case. (jrp) (Entered: 11/19/2014)"
        },
        ...
      ],
      "headers": [
        {
          "meta": {
            "case_uuid": "orbtrain_458907",
            "filename": "orbtrain_458907",
            "timestamp": 1533152406.84978
          },
          "text": {
            "case_code": null,
            "case_title": null,
            "case_type": null,
            "case_uuid": "orbtrain_458907",
            "chapter": null,
            "has_asset": null,
            "title": null
          }
        },
        ...
      ],
      "receipts": [
        {
          "meta": {
            "case_uuid": "orbtrain_458907",
            "filename": "b25e00ca-95c2-11e8-a309-f390bed07e61",
            "timestamp": 1533152406.84978
          },
          "text": {
            "client_code": "",
            "cost": "0.10",
            "criteria": "14-63619-7 Fil or Ent: filed Doc From: 0 Doc To: 99999999 Term: included Format: html Page counts for documents: included",
            "datetime": "08/01/2018 12:40:08",
            "description": "Docket Report",
            "pages": "1",
            "user_id": "irtraining"
          }
        }
      ]
    },
    "queries": {
      "docket_headers": [
        {
          "meta": {
            "case_uuid": "orbtrain_458907",
            "filename": "orbtrain_458907_8d966bf13952d25dcc1b76511269eff3",
            "timestamp": 1533152406.84978
          },
          "text": {
            "attorneys": [],
            "trustees": []
          }
        }
      ]
    }
  }
```

Note that we have a receipt for the PACER charges in the response.

### Show a Specific Docket Entry

Endpoint: `GET /cases/pacer/{court}/{case}/dockets/{docket_no}`

This shows a specific docket entry.  This is handled by the `getDocketEntry()`
method of the `CaseApi`.

Sample Code:
```javascript
  const caseApi = new CourtApi.CaseApi();

  caseApi.getDocketEntry(court, caseNumber, docketSeq,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `docket/show-entry.js <court> <case number> <docket number>`

Example:
```shell
  $ docket/show-entry.js orbtrain 6:14-bk-63619 4.00000
  {
    "entry": {
      "action": null,
      "annotations": [
        {
          "datetime": "2014-12-19",
          "highlight_phrase": "12/19/2014",
          "key_phrase": "Amended Order To Pay Filing Fees in Installments 1st Installment Payment due"
        },
        {
          "datetime": "2015-01-20",
          "highlight_phrase": "1/20/2015",
          "key_phrase": "FINAL Installment Payment due"
        }
      ],
      "case_docket_entry_id": 81274897,
      "case_uuid": "orbtrain_458907",
      "date_filed": "11/19/2014",
      "docket_no": 4,
      "docket_seq": "4.00000",
      "docket_text": "Amended Order To Pay Filing Fees in Installments 1st Installment Payment due by 12/19/2014. FINAL Installment Payment due by 1/20/2015. (jrp) (Entered: 11/19/2014)",
      "docket_uri": null,
      "links": {
        "documents": {
          "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000/documents"
        },
        "self": {
          "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000"
        }
      },
      "timestamp": 1533152408.37436
    },
    "links": {
      "header": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/header"
      },
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/update",
        "method": "POST"
      },
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000"
      }
    }
  }
```

### Purchase and Download Documents for a Docket Entry

Endpoint: `GET /cases/pacer/{court}/{case}/dockets/{docket_no}/documents`

This endpoint provides information about the documents available for a docket
entry. This is handled by the `getDocketDocuments()` method of the `CaseApi`.

Sample Code:
```javascript
  const caseApi = new CourtApi.CaseApi();

  caseApi.getDocketDocuments(court, caseNumber, docketSeq,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `docket/list-documents.js <court> <case number> <docket number>`

Example: Document Parts Not Yet Imported from PACER:
```shell
  $ docket/list-documents.js orbtrain 6:14-bk-63619 2.00000
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/2.00000/documents",
        "method": "POST"
      }
    },
    "parts": []
  }
```

If the `parts` list is empty, it means you need to update the document entry
from PACER using `updateDocketDocuments()` from the `QueryApi` (see the
next section).

If the document information has *already* been imported, the response looks
like this:

Example: Document Parts in CourtAPI
```shell
  $ docket/list-documents.js orbtrain 6:14-bk-63619 3.00000
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents",
        "method": "POST"
      }
    },
    "parts": [
      {
        "cost": null,
        "description_html": null,
        "docket_no": 3,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1"
          }
        },
        "number": 1,
        "pages": 2
      }
    ]
  }
```

### Update Docket Entry Documents from PACER

Endpoint: `POST /cases/pacer/{court}/{case}/dockets/{docket_no}/documents`

This endpoint updates the docket entry documents information for a specific
docket entry.  This is done via the `updateDocketDocuments()` method in
the `QueryApi`.

Sample Code:
```javascript
  const queryApi = new CourtApi.QueryApi();

  queryApi.updateDocketDocuments(court, caseNumber, docketSeq,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `docket/update-documents.js <court> <case number> <docket number>`

Example Output - Document Updated:

```shell
  $ docket/update-documents.js orbtrain 6:14-bk-63619 3.00000
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents",
        "method": "POST"
      }
    },
    "parts": [
      {
        "cost": null,
        "description_html": null,
        "docket_no": 3,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1"
          }
        },
        "number": 1,
        "pages": 2
      }
    ]
  }
```

We can see that a document with 1 part and 2 pages is available now.  The
`parts.links.order_pdf.href` endpoint is the location where the PDF can be
purchased or downloaded.

However, not all docket entries have documents.  For example, consider the
following PACER request to update the docket entry documents:

Example Output: No Document Available
```shell
  $ docket/update-documents.js orbtrain 6:14-bk-63619 4.00000
  ERROR: 400
  {
    "errorMessage": "No PDF Document available for Case orbtrain_458907, Docket entry: #4.00000",
    "status": "fail"
  }
```

### Display Docket Entry Document Parts

Endpoint: `GET /cases/pacer/{court}/{case}/dockets/{docket_no}/documents/{part}`

This endpoint is the `order_pdf` link endpoint from the previous section.  This
is where you would actually buy or download the PDF.

This endpoint is handled by the `getDocketDocument()` endpoint in the
`CaseApi`.

Sample Code:
```javascript
  const caseApi = new CourtApi.CaseApi();

  caseApi.getDocketDocument(court, caseNumber, docketSeq, partNo,
    function (error, data, response) {
      if (error)
        return handlers.errorHandler(error);

      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `docket/show-document-part.js <court> <case number> <docket number> <document part number>`

Example Output - Document Not Yet Purchased:
```shell
  $ docket/show-document-part.js orbtrain 6:14-bk-63619 3.00000 1
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1",
        "method": "POST"
      }
    },
    "origin": "cache",
    "part": {},
    "status": "success"
  }
```

The `part` section is empty, which indicates we need to purchase the document
from PACER, using the `update-pacer` link (see the next section).

Example Output - Document Already Purchased:
```shell
  $ docket/show-document-part.js orbtrain 6:14-bk-63619 3.00000 1
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1",
        "method": "POST"
      }
    },
    "origin": "cache",
    "part": {
      "cost": null,
      "description_html": null,
      "download_url": "http://aws-s3.inforuptcy.dev.azk.io:32827/inforuptcy-storage/pacer/orbtrain/458907/dockets/3.00000/1-4D274924-9599-11E8-A309-F390BED07E61?response-content-disposition=attachment%3B+filename%3DBankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf&AWSAccessKeyId=courtapi_dummy_key&Expires=1848753989&Signature=8tzx2PUdfo%2BJqaTp%2BvkYdbBUgf4%3D",
      "filename": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "friendly_name": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "number": 1,
      "pages": 2
    },
    "status": "success"
  }
```

At that point, the PDF can be downloaded at the `part.download_url` and saved
wherever you want.  Suggested filenames are available in the `part.filename`
and `part.friendly_name` fields.

Example Output - No Document Available:
```
  $ docket/show-document-part.js orbtrain 6:14-bk-63619 4.00000 1
  ERROR: 400
  {
    "errorMessage": "No PDF Document available for Case orbtrain_458907, Docket entry: #4.00000",
    "status": "fail"
  }
```
No document was available for this docket entry.

### Purchase Docket Entry PDF from PACER

Endpoint: `POST /cases/pacer/{court}/{case}/dockets/{docket_no}/documents/{part}`

This endpoint purchases (and imports or updates) a PDF from PACER.  This is
handled by the `buyDocketDocument()` method in the `QueryApi`.

Sample Code:
```javascript
  const queryApi = new CourtApi.QueryApi();

  queryApi.buyDocketDocument(court, caseNumber, docketSeq, partNo,
    function (error, data, response) {
      if (error)
        return handlers.errorHandler(error);

      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `docket/buy-document-part.js <court> <case number> <docket number> <document part number>`

Example Output:
```shell
  $ docket/buy-document-part.js orbtrain 6:14-bk-63619 3.00000 1
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1",
        "method": "POST"
      }
    },
    "origin": "PACER",
    "part": {
      "action": "https://ecf-train.orb.uscourts.gov/doc3/150114375608?caseid=458907",
      "case_uuid": "orbtrain_458907",
      "cost": null,
      "description_html": null,
      "docket_no": "3.00000",
      "download_url": "http://aws-s3.inforuptcy.dev.azk.io:32827/inforuptcy-storage/pacer/orbtrain/458907/dockets/3.00000/1-4D274924-9599-11E8-A309-F390BED07E61?response-content-disposition=attachment%3B+filename%3DBankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf&AWSAccessKeyId=courtapi_dummy_key&Expires=1848753829&Signature=Xr4XTA7qys%2FyuqusjBBZ6fASmvc%3D",
      "filename": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "free": null,
      "friendly_name": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "number": 1,
      "ocr_link": "http://aws-s3.inforuptcy.dev.azk.io:32827/inforuptcy-storage/pacer-ocr/pacer/orbtrain/458907/dockets/3.00000/1-4D274924-9599-11E8-A309-F390BED07E61.txt?response-content-disposition=attachment%3B+filename%3DBankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf.txt&AWSAccessKeyId=courtapi_dummy_key&Expires=1848753829&Signature=wvPNCkgr9CUgzc10dZH7LNFiGa0%3D",
      "pages": 2,
      "raw_location": "s3://inforuptcy-storage/pacer/orbtrain/458907/dockets/3.00000/1-4D274924-9599-11E8-A309-F390BED07E61",
      "sequence_number": "3.00000"
    },
    "receipt": {
      "meta": {
        "case_uuid": null,
        "filename": "4c3fdf12-9599-11e8-a309-f390bed07e61",
        "timestamp": null
      },
      "text": {
        "client_code": "",
        "cost": "0.20",
        "criteria": "14-63619-7",
        "datetime": "Wed Aug 1 07:43:47 2018",
        "description": "Image:3-0",
        "pages": "2",
        "user_id": "irtraining"
      }
    },
    "status": "success"
  }
```

At this point, we have everything we need to save the PDF.  The document can be
downloaded at the `part.download_url` location, and either saved locally using
whatever filename you want, or, using the `part.filename` or
`part.friendly_name` suggestions.

Note also that the response includes a receipt for the PACER charges that were
incurred.

Once the document has been purchased, the `getDocketDocument()` method from the
`CaseApi` can be used to retrieve the download location and filename etc again
without incurring additional PACER charges.

## Purchase and Display a Claims Register

This section demonstrates how to use CourtAPI to locate a case, buy and display
the claims register, and find and purchase documents in the claim register.

### Search for the Case

Searching for the case is the same as before, using the `searchCourtCases()` or
`showCourtCase()` methods from the `CaseApi`.

Sample Code:
```javascript
  const caseApi = new CourtApi.PacerCaseLookupApi();

  const search = {
    openCases: true,
    caseNo: caseNumber
  };

  caseApi.searchCourtCases(court, search, function (error, data, response) {
    console.log(JSON.stringify(response.body, null, 2));
  });
```

Usage: `court/search-cases.js <court> <case number>`

```
  $ court/search-cases.js azbtest 2:07-bk-00012
  {
    "cases": [
      {
        "case_no": "2:07-bk-00012",
        "case_title": "Joseph Wayne Sample and Sarah Lynn Sample",
        "chapter": 11,
        "court_code": "azbtest",
        "date_closed": null,
        "date_filed": "02/19/2007",
        "lead_bk_case_no": null,
        "lead_bk_case_title": null,
        "links": {
          "dockets": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/dockets"
          },
          "self": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012"
          }
        },
        "timestamp": 1533153623.89584,
        "title": "Joseph Wayne Sample and Sarah Lynn Sample"
      }
    ],
    "parties": [],
    "receipts": []
  }
```

### Show Claims Register

Endpoint `GET /cases/pacer/{court}/{case}/claims`

This endpoint finds the claims entries for a case in the CourtAPI database.
`getClaims()` method in the `CaseApi`.

Sample Code:
```
  const caseApi = new CourtApi.CaseApi();

  // many things are possible here.
  const search = {
    // only show entries containing a keyword
    searchKeyword: 'bloomingdales',
    pageSize: 10,
    pageNumber: 1
  };

  caseApi.getClaims(court, caseNumber, docketOptions,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `claim/list.js <court> <case number>`

Example - No Matches, or, PACER update needed:
```shell
  $ claim/list.js orbtrain 6:14-bk-63619
  {
    "claimed_amounts": {
      "admin_claimed": "0.00",
      "amount_claimed": "0.00",
      "priority_claimed": "0.00",
      "secured_claimed": "0.00",
      "unknown_claimed": "0.00",
      "unsecured_claimed": "0.00"
    },
    "entries": {
      "content": [],
      "links": {
        "self": {
          "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/claims?search_keyword=Order&sort_order=desc&page_size=10&page_number=1"
        }
      },
      "page_size": "10",
      "total_items": 0,
      "total_pages": 1
    },
    "links": {
      "header": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/claims/header"
      },
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/claims/update",
        "method": "POST"
      },
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/orbtrain/6:14-bk-63619/claims?search_keyword=Order&sort_order=desc&page_size=10"
      }
    }
  }
```

In this example, the `entries.content` list is empty, and the `total_items` is
`0`.  Either nothing matched the search keyword, or, this claims register has not
yet been purchased from PACER.  The `links.pacer-update` endpoint is used to
buy the updated claims register from PACER.

Note that just like the dockets list, the claims register is paginated.  The
response may contain multiple pages and you need to fetch all of the pages in
order to get the complete list of claims.

Example: Case not found or not imported from PACER:
```
  $ claim/list.js azbtest 2:07-bk-00012
  ERROR: 400
  {
    "error": "No Matching Case Found for 2:07-bk-00012 at azbtest"
  }
```

This indicates the case was not found, or, that you need to use the PACER
search endpoint to import it from PACER.

Example: Claims Register already in CourtAPI
```
  $ claim/list.js azbtest 2:07-bk-00012
  {
    "claimed_amounts": {
      "admin_claimed": "0.00",
      "amount_claimed": "160.00",
      "priority_claimed": "0.00",
      "secured_claimed": "0.00",
      "unknown_claimed": "0.00",
      "unsecured_claimed": "160.00"
    },
    "entries": {
      "content": [
        {
          "amounts": {
            "amount": {
              "claimed": "160.00"
            },
            "unsecured": {
              "claimed": "160.00"
            }
          },
          "creditor": "Bloomingdales\nPO Box 8745\nNew York NY 10012-8745",
          "description": "(1-1) test<BR>",
          "history": [
            {
              "action": "https://ecf-test.azb.uscourts.gov/cgi-bin/show_doc.pl?caseid=2644&claim_id=51742&claim_num=1-1&magic_num=MAGIC",
              "case_uuid": "azbtest_2644",
              "claim_date": "06/11/2007",
              "claim_no": "1-1",
              "claim_seq": "1-1.00000",
              "claim_text": "06/11/2007 Claim #1 filed by Bloomingdales, Amount claimed: $160.00 (Fouche, Cindy)",
              "claim_uri": null,
              "detail_uri": null,
              "links": {
                "documents": {
                  "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000"
                }
              }
            }
          ],
          "info": {
            "claim_no": 1,
            "original_entered_date": "06/11/2007",
            "original_filed_date": "06/11/2007",
            "timestamp": 1533138731.91653
          },
          "links": {
            "self": {
              "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1"
            }
          },
          "remarks": null,
          "status": null
        }
      ],
      "links": {
        "self": {
          "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims?sort_order=desc&page_size=10&page_number=1"
        }
      },
      "page_size": "10",
      "total_items": 1,
      "total_pages": 1
    },
    "links": {
      "header": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/header"
      },
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/update",
        "method": "POST"
      },
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims?sort_order=desc&page_size=10"
      }
    }
  }
```

### Buy or Update Claims Register

Endpoint `POST /cases/pacer/{court}/{case}/claims/update`

This endpoint buys and imports (or updates) the claims register for a case from
PACER into CourtAPI.  This is handled by the `updateClaims()` method in the
`QueryApi`.

Sample Code:
```javascript
  const queryApi = new CourtApi.QueryApi();

  // you can restrict what claims are fetched with an options argument,
  // or just use "null" to get the entire claims register
  queryApi.updateClaims(court, caseNumber, null,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `claim/update.js <court> <case number>`

Example:

```shell
  $ claim/update.js azbtest 2:07-bk-00012
  {
    "case": {
      "appeal_case_uuid": null,
      "assets": "Unknown",
      "assigned_to": null,
      "case_chapter_id": 3,
      "case_court_id": 107,
      "case_id": 5083528,
      "case_id_external": 2644,
      "case_no": "2:07-bk-00012",
      "case_petition_id": 1,
      "case_title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "case_type_id": 1,
      "case_uuid": "azbtest_2644",
      "cause": null,
      "ch11_type": null,
      "ch11_type_code": null,
      "chapter": 11,
      "court": "azbtest",
      "court_name": "azbtest",
      "created": "2018-08-01 15:51:57.004902+00",
      "date_closed": null,
      "date_discharged": null,
      "date_filed": "02/19/2007",
      "date_of_last_filing": "10/08/2013",
      "date_plan_confirmed": "07/30/2007",
      "date_terminated": null,
      "disabled": 0,
      "disposition": null,
      "has_asset": 1,
      "industry": null,
      "is_business_bankruptcy": null,
      "judge_name": "Brenda Moody Whinery",
      "jurisdiction": null,
      "jury_demand": null,
      "lead_case_uuid": null,
      "liabilities": "Unknown",
      "modified": "2018-08-01 15:52:11.894276+00",
      "naics_code": null,
      "nature_of_debt": null,
      "nature_of_suit_code": null,
      "ncl_parties": [],
      "referred_to": null,
      "schedule_ab": null,
      "timestamp": 1533138731.89428,
      "title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "uri_id": 85055161,
      "website": null
    },
    "forms": {
      "case_code": "2-07-bk-12",
      "creditor_name": null,
      "creditor_no": null,
      "creditor_type": null,
      "date_from": null,
      "date_to": null,
      "date_type": null,
      "doc_from": null,
      "doc_to": null
    },
    "items": {
      "claim_headers": [
        {
          "meta": {
            "case_uuid": "azbtest_2644",
            "filename": "azbtest_2644",
            "timestamp": 1533138731.05036
          },
          "text": {
            "header": "... [ header HTML ] ...",
            "summary": "... [ summary HTML ] ..."
          }
        }
      ],
      "claims": [
        {
          "meta": {
            "case_uuid": "azbtest_2644",
            "claim_no": "1",
            "filename": "azbtest_2644_1",
            "timestamp": 1533138731.05036
          },
          "text": {
            "amounts": {
              "admin": {},
              "amount": {
                "claimed": "$160.00"
              },
              "priority": {},
              "secured": {},
              "unknown": {},
              "unsecured": {
                "claimed": "$160.00"
              }
            },
            "creditor": "Bloomingdales\nPO Box 8745\nNew York NY 10012-8745",
            "description": "(1-1) test<BR>",
            "history": [
              {
                "case_uuid": "azbtest_2644",
                "claim_date": "06/11/2007",
                "claim_history_no": 1,
                "claim_no": "1-1",
                "claim_seq": 0,
                "claim_text": "Claim #1 filed by Bloomingdales, Amount claimed: $160.00 (Fouche, Cindy)",
                "claim_uri": "https://ecf-test.azb.uscourts.gov/cgi-bin/show_doc.pl?caseid=2644&claim_id=51742&claim_num=1-1&magic_num=MAGIC",
                "detail_uri": "https://ecf-test.azb.uscourts.gov/cgi-bin/ClaimHistory.pl?2644,1-1,1064,2:07-bk-00012-BMW"
              }
            ],
            "info": {
              "claim_no": "1",
              "original_entered_date": "06/11/2007",
              "original_filed_date": "06/11/2007"
            },
            "remarks": null,
            "status": {
              "entered_by": "Cindy Fouche",
              "filed_by": "CR",
              "modified": "11/15/2007"
            }
          }
        }
      ],
      "receipts": [
        {
          "meta": {
            "case_uuid": "azbtest_2644",
            "filename": "azbtest_2644",
            "timestamp": 1533138731.05036
          },
          "text": {
            "client_code": "",
            "cost": "0.10",
            "criteria": "2:07-bk-00012-BMW",
            "datetime": "08/01/2018 08:52:11",
            "description": "Claims Register",
            "pages": "1",
            "user_id": "test:3611309:0"
          }
        }
      ]
    },
    "queries": {}
  }
```

Note that we have a receipt for the PACER charges in the response.

### Display a Specific Claim Entry

Endpoint `GET /cases/pacer/{court}/{case}/claims/{claim_no}`

This endpoint displays a specific claim register entry on CourtAPI.  This is
handled by the method `getClaim()` in the `CaseApi`.

Sample Code:
```javascript
  const caseApi = new CourtApi.CaseApi();

  caseApi.getClaim(court, caseNumber, claimNumber,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `claim/show.js <court> <case number> <claim number>`

Example:
```shell
  $ claim/show.js azbtest 2:07-bk-00012 1
  {
    "entry": {
      "amounts": {
        "amount": {
          "claimed": "160.00"
        },
        "unsecured": {
          "claimed": "160.00"
        }
      },
      "creditor": "Bloomingdales\nPO Box 8745\nNew York NY 10012-8745",
      "description": "(1-1) test<BR>",
      "history": [
        {
          "action": "https://ecf-test.azb.uscourts.gov/cgi-bin/show_doc.pl?caseid=2644&claim_id=51742&claim_num=1-1&magic_num=MAGIC",
          "case_uuid": "azbtest_2644",
          "claim_date": "06/11/2007",
          "claim_no": "1-1",
          "claim_seq": "1-1.00000",
          "claim_text": "06/11/2007 Claim #1 filed by Bloomingdales, Amount claimed: $160.00 (Fouche, Cindy)",
          "claim_uri": null,
          "detail_uri": null,
          "links": {
            "documents": {
              "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000"
            }
          }
        }
      ],
      "info": {
        "claim_no": 1,
        "original_entered_date": "06/11/2007",
        "original_filed_date": "06/11/2007",
        "timestamp": 1533138731.91653
      },
      "links": {
        "self": {
          "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1"
        }
      },
      "remarks": null,
      "status": null
    },
    "links": {
      "header": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/header"
      },
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1.00000"
      }
    }
  }
```

Example: Claim Entry Not Found or not yet imported from PACER
```
  $ claim/show.js azbtest 2:07-bk-00012 2
  {
    "entry": {},
    "links": {
      "header": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/header"
      },
      "self": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/2"
      }
    }
  }
```

### Show Claim Entry Document Parts

Endpoint `GET /cases/pacer/{court}/{case}/claims/{claim_no}/documents/{claim_sequence}`

This endpoint displays document parts for a claim entry.  This is handled by
the `getClaimParts()` method in the `CaseApi`

Sample Code:
```javascript
  const caseApi = new CourtApi.CaseApi();

  caseApi.getClaimParts(court, caseNumber, claimNumber, claimSeqNo,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `claim/list-parts.js <court> <case number> <claim number> <claim sequence>`

Example: PACER Update needed
```shell
  $ claim/list-parts.js azbtest 2:07-bk-00012 1 1.00000
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
        "method": "POST"
      }
    },
    "parts": []
  }
```

Note that the `parts` array is empty, indicating that a PACER update is needed,
or, that there are no parts available for this entry.

Example: Document Already Imported
```shell
  $ claim/list-parts.js azbtest 2:07-bk-00012 1 1.00000
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
        "method": "POST"
      }
    },
    "parts": [
      {
        "cost": null,
        "description_html": "Claim 51742-0",
        "docket_no": null,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1"
          }
        },
        "number": 1,
        "pages": 3
      }
    ]
  }
```

Here we have a single document part in this claim entry, with 3 pages.  It can
be purchased or downloaded at the `links.order_pdf` location.

### Update Claim Entry Document Parts

Endpoint `POST /cases/pacer/{court}/{case}/claims/{claim_no}/documents/{claim_sequence}`

This endpoint updates a claim document part from PACER. This done via the
`updateClaimParts()` method in the `QueryApi`.

Sample Code:
```javascript
  const queryApi = new CourtApi.QueryApi();

  queryApi.updateClaimParts(court, caseNumber, claimNumber, claimSeqNo,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `claim/update-parts.js <court> <case number> <claim number> <claim sequence>`

Example:
```shell
  $ claim/update-parts.js azbtest 2:07-bk-00012 1 1.00000
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
        "method": "POST"
      }
    },
    "parts": [
      {
        "cost": null,
        "description_html": "Claim 51742-0",
        "docket_no": null,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1"
          }
        },
        "number": 1,
        "pages": 3
      }
    ]
  }
```

This response indicates that we have a single PDF available for this claim with
3 pages.  The PDF can be accessed or purchased at the `parts.links.order_pdf`
endpoint.  Note that a single claim entry may have multiple document parts.  In
this entry, there is only a single part.

### Show Claim Entry Part Document

Endpoint `GET /cases/pacer/{court}/{case}/claims/{claim}/documents/{sequence}/{part}'

This is handled by the `getClaimDocument()` method in the `CaseApi`.

Sample Code:
```javascript
  const caseApi = new CourtApi.CaseApi();

  caseApi.getClaimDocument(court, caseNumber, claimNumber, claimSeqNo, claimPartNo,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Usage: `claim/show-part.js <court> <case> <claim> <claim sequence> <part>`

Example: Document not yet purchased from PACER
```shell
  $ claim/show-part.js azbtest 2:07-bk-00012 1 1.00000 1
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1",
        "method": "POST"
      }
    },
    "origin": "cache",
    "part": {},
    "status": "success"
  }
```

The origin here was `cache` (meaning the local database), and the `part`
section is empty, so we know that we need to purchase the PDF from PACER.

Example: Document Already Purchased from PACER
```shell
  $ claim/show-part.js azbtest 2:07-bk-00012 1 1.00000 1
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1",
        "method": "POST"
      }
    },
    "origin": "cache",
    "part": {
      "cost": null,
      "description_html": "Claim 51742-0",
      "download_url": "http://aws-s3.inforuptcy.dev.azk.io:32827/inforuptcy-storage/pacer/azbtest/2644/claims/1/1.00000/1-DAC97B08-95A8-11E8-A309-F390BED07E61?response-content-disposition=attachment%3B+filename%3DBankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf&AWSAccessKeyId=courtapi_dummy_key&Expires=1848760740&Signature=1wmUxJhIvv1XuPE0H7Pijx0SJZ4%3D",
      "filename": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "friendly_name": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "number": 1,
      "pages": 3
    },
    "status": "success"
  }
```

In this example the document was already present on CourtAPI, and can be
downloaded at the location in `part.download_url` and saved in a filename of
your choice, or, using the suggested filename of either `part.filename` or
`part.friendly_name`.

### Buy Claim Entry PDF

Endpoint `POST /cases/pacer/{court}/{case}/claims/{claim}/documents/{sequence}/{part}`

This is handled by the `buyClaimDocument()` method in the `QueryApi`.

Sample Code:
```javascript
  const queryApi = new CourtApi.QueryApi();

  queryApi.buyClaimDocument(court, caseNumber, claimNumber, claimSeqNo, claimPartNo,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Example:
```shell
  $ claim/buy-part.js azbtest 2:07-bk-00012 1 1.00000 1
  {
    "links": {
      "pacer-update": {
        "href": "http://courtapi.inforuptcy.dev.azk.io/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1",
        "method": "POST"
      }
    },
    "origin": "PACER",
    "part": {
      "action": "https://ecf-test.azb.uscourts.gov/doc2/02418759",
      "case_uuid": "azbtest_2644",
      "description_html": "Claim 51742-0",
      "docket_no": "1-1.00000",
      "download_url": "http://aws-s3.inforuptcy.dev.azk.io:32827/inforuptcy-storage/pacer/azbtest/2644/claims/1/1.00000/1-DAC97B08-95A8-11E8-A309-F390BED07E61?response-content-disposition=attachment%3B+filename%3DBankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf&AWSAccessKeyId=courtapi_dummy_key&Expires=1848760509&Signature=Pjsr9jcnxquqlWzRpvnMPswEj2c%3D",
      "filename": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "friendly_name": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "history_number": "1",
      "number": 1,
      "ocr_link": "http://aws-s3.inforuptcy.dev.azk.io:32827/inforuptcy-storage/pacer-ocr/pacer/azbtest/2644/claims/1/1.00000/1-DAC97B08-95A8-11E8-A309-F390BED07E61.txt?response-content-disposition=attachment%3B+filename%3DBankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf.txt&AWSAccessKeyId=courtapi_dummy_key&Expires=1848760509&Signature=tSmjboIo2LKGNb4YFcRJ7BG1h%2BA%3D",
      "pages": 3,
      "raw_location": "s3://inforuptcy-storage/pacer/azbtest/2644/claims/1/1.00000/1-DAC97B08-95A8-11E8-A309-F390BED07E61"
    },
    "receipt": {
      "meta": {
        "case_uuid": null,
        "filename": "d9fcee76-95a8-11e8-a309-f390bed07e61",
        "timestamp": null
      },
      "text": {
        "client_code": "",
        "cost": "0.30",
        "criteria": "2:07-bk-00012-BMW",
        "datetime": "Wed Aug 1 09:35:07 2018",
        "description": "Claim 51742-0",
        "pages": "3",
        "user_id": "test:3611309:0"
      }
    },
    "status": "success"
  }
```

Notice here that we have a receipt for the PACER charges, as well as all of the
information we need to download the PDF and save it locally.  The PDF can be
downloaded from the `part.download_url` location in the response, and either
saved in a filename of your own choice, or, using the suggested filenames in
`part.filename` or `part.friendly_name`.

# Complete Example: Generate a Complete Docket Sheet for a Case

The NodeJS program `make-docket-sheet.js` is a complete example that does all
of the following things:

- Searches for a case on CourtAPI
- If not found, imports the case into CourtAPI from PACER
- Purchases and updates the docket from PACER if necessary
- Prints the case header and all docket entries to an output file

Example Usage:

```javascript
  $ ./make-docket-sheet.js orbtrain 6:14-bk-63619
  Saved docket sheet as docket-sheet.html
```
This example builds on all of the above snippets to generate the docket sheet.
See the source code for details.

# Complete Example: Generate a Claims Register for a Case

The NodeJS program `make-claims-register.js` is another complete example, that
builds on all of the individual snippets to create a claims register HTML
document for a case.  This program does all of the following things:

- Searches for a case on CourtAPI.
- If not found, imports the case into CourtAPI from PACER.
- Purchases and updates the claims sheet from PACER if necessary.
- Prints the Claims register header, and all claims entries to an output HTML file.

This, like the docket sheet generator, combines several of the snippets in
other programs to accomplish the task.

Example Usage:

```shell
  $ ./make-claims-register.js azbtest 2:07-bk-00012
  Saved claims register as claims-register.html
```

# Complete Example: Search for Update a case, Search Claims Register Entries, Buy and Download PDFs

The NodeJS program `purchase-and-download-claims-pdfs.js` is another complete
example, that builds on all of the individual snippets.  This program does all
of the following items:

- Searches for a case in CourtAPI
- If the case is not found, searches for it in PACER (importing it into CourtAPI)
- Purchases and updates the claims entries for the case in CourtAPI (from PACER)
- Searches for all claims register entries that match a keyword
- For each matched entry, updates the documents list from PACER and buys all PDFs.
- Downloads all of the matched PDFs to the current directory

Example Usage:

This example searches for all Claims entries that match the keyword
`Bloomingdales` in the case `2:07-bk-00012` in the court "azbtest".

```shell
  ./purchase-and-download-claims-pdfs.js azbtest 2:07-bk-00012 Bloomingdales
```

Output:
```shell
  Downloading file: Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf
```

This shows that a single claims entry was matched in the case and the PDF was
downloaded.

# Complete Example: Search for and Update a case, Buy Docket Sheet, Search Docket Entries Entries, Buy and Download PDFs

The NodeJS program `purchase-and-download-docket-pdfs.js` is another complete
example.  This program does all of the following items:

- Searches for a case in CourtAPI
- If the case is not found, searches for it in PACER (importing it into CourtAPI)
- Purchases and updates the docket sheet for the case in CourtAPI (from PACER)
- Searches for all docket entires that match a keyword.
- For each matched entry, updates the documents list from PACER and buys all PDFs.
- Downloads all of the matched PDFs to the current directory

Example Usage:

This example will buy and download all PDFs for docket entries that match the
keyword "jrp" in the case number 6:14-bk-63619 in the court "orbtrain":

```shell
  $ ./purchase-and-download-docket-pdfs.js orbtrain 6:14-bk-63619 jrp
```

Output:
```shell
  Downloading file: Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf
  No PDF Document available for Case orbtrain_458907, Docket entry: #4.00000
  No PDF Document available for Case orbtrain_458907, Docket entry: #0.00000
  No PDF Document available for Case orbtrain_458907, Docket entry: #1.00000
  No PDF Document available for Case orbtrain_458907, Docket entry: #2.00000
```

This shows us that 5 docket entries were matched, but only one of them has a
PDF, which was downloaded (docket entry 3.00000).
