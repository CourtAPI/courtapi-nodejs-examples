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
  $ pacer/show-credentials.js
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
```
```javascript
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
  $ court/search.js
```
```javascript
  {
    "code": "akbtest",
    "links": {
      "self": {
        "href": "https://train.v1.courtapi.com/courts/pacer/akbtest"
      }
    },
    "name": "Alaska TEST Bankruptcy Court"
  }
  {
    "code": "akbtrain",
    "links": {
      "self": {
        "href": "https://train.v1.courtapi.com/courts/pacer/akbtrain"
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
```
```javascript
  {
    "abbr": "orbtrain",
    "citation": "Bankr.D.Or.TRAIN.",
    "links": {
      "cases_report_bk": {
        "href": "https://train.v1.courtapi.com/courts/pacer/orbtrain/cases/report/bankruptcy"
      },
      "cases_search": {
        "href": "https://train.v1.courtapi.com/courts/pacer/orbtrain/cases/search"
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
  $ court/search-cases.js orbtrain 6:14-bk-63619
```

And then re-run `court/show-case.js`

```shell
  $ court/show-case.js orbtrain 6:14-bk-63619
```
```javascript
  {
    "case": {
      "assets": "Unknown",
      "assigned_to": null,
      "case_category": "bankruptcy",
      "case_no": "6:14-bk-63619",
      "case_title": "Somewhere Someone",
      "case_type": "bk",
      "cause": null,
      "ch11_type": null,
      "chapter": 7,
      "court_code": "orbtrain",
      "date_closed": null,
      "date_discharged": null,
      "date_filed": "11/19/2014",
      "date_of_last_filing": "11/19/2014",
      "date_terminated": null,
      "disposition": null,
      "has_asset": "No",
      "judge_name": null,
      "jurisdiction": null,
      "jury_demand": null,
      "modified": "2018-09-25T17:09:34.803730Z",
      "nature_of_suit_code": null,
      "petition_type": "v",
      "plan_confirmed": null,
      "referred_to": null
    },
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619",
        "method": "POST"
      },
      "self": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619"
      }
    },
    "menu": {}
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
```
```javascript
  {
    "cases": [
      {
        "case_no": "6:14-bk-63619",
        "case_title": "Somewhere Someone",
        "chapter": 7,
        "court_code": "orbtrain",
        "date_closed": null,
        "date_filed": "11/19/2014",
        "lead_bk_case_no": null,
        "lead_bk_case_title": null,
        "links": {
          "dockets": {
            "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets"
          },
          "self": {
            "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619"
          }
        },
        "timestamp": "2018-09-25T17:09:34.803730Z",
        "title": "Somewhere Someone"
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
```
```javascript
  // -- PAGE 1/1 --
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
          "binder": {
            "documents": [],
            "links": {
              "pacer-update": {
                "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000/documents",
                "method": "POST"
              }
            }
          },
          "date_filed": "11/19/2014",
          "docket_no": 4,
          "docket_seq": "4.00000",
          "docket_text": "Amended Order To Pay Filing Fees in Installments 1st Installment Payment due by 12/19/2014. FINAL Installment Payment due by 1/20/2015. (jrp) (Entered: 11/19/2014)",
          "has_pdf_link_on_pacer": false,
          "links": {
            "documents": {
              "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000/documents"
            },
            "self": {
              "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/4.00000"
            }
          },
          "timestamp": "2018-09-25T17:13:46.039520Z"
        },
        {
          "annotations": [
            {
              "datetime": "2014-12-19",
              "highlight_phrase": "12/19/2014",
              "key_phrase": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due"
            },
            {
              "datetime": "2015-01-20",
              "highlight_phrase": "1/20/2015",
              "key_phrase": "2nd Installment Payment due"
            },
            {
              "datetime": "2015-02-17",
              "highlight_phrase": "2/17/2015",
              "key_phrase": "FINAL Installment Payment due"
            }
          ],
          "binder": {
            "documents": [
              {
                "cost": "0.20",
                "description_html": null,
                "docket_no": 3,
                "filename": null,
                "free": null,
                "friendly_name": null,
                "links": {
                  "order_pdf": {
                    "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1"
                  }
                },
                "number": 1,
                "pages": 2
              }
            ],
            "links": {
              "pacer-update": {
                "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents",
                "method": "POST"
              }
            }
          },
          "date_filed": "11/19/2014",
          "docket_no": 3,
          "docket_seq": "3.00000",
          "docket_text": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due by 12/19/2014. 2nd Installment Payment due by 1/20/2015. FINAL Installment Payment due by 2/17/2015. (jrp) (Entered: 11/19/2014)",
          "has_pdf_link_on_pacer": true,
          "links": {
            "documents": {
              "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents"
            },
            "self": {
              "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000"
            }
          },
          "timestamp": "2018-09-25T17:13:46.039520Z"
        },
      ],
      "links": {
        "self": {
          "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets?sort_order=desc&page_size=50&page_number=1"
        }
      },
      "page_size": "50",
      "total_items": 5,
      "total_pages": 1
    },
    "header": {
      "assigned_to": " ",
      "attorneys": [],
      "chapter": "7",
      "date_filed": "11/19/2014",
      "has_asset": 0,
      "header_html_timestamp": "2018-09-25T17:13:46Z",
      "html": "... header HTML ...",
      "is_header_html_valid": 1,
      "latest_docket_number": 4,
      "latest_history_number": null,
      "latest_known_date_filed": "11/19/2014",
      "modified": "2018-09-25T17:13:45.986760Z",
      "trustees": [],
      "voluntary": 1
    },
    "links": {
      "header": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/header"
      },
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/update",
        "method": "POST"
      },
      "self": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets?sort_order=desc&page_size=50"
      }
    }
  }
```

A few things to note here:

* The individual docket entries are located under `entries.content`
* Documents attached to individual docket entries are under the `binder` key
  inside the docket entry.
* If your final intention is merely to order or download PDF's no additional
  calls are needed other than to go straight to the `order_pdf` endpoint for
  the document.

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
```
```javascript
  {
    "case": {
      "appeal_case_uuid": null,
      "assets": "Unknown",
      "assigned_to": " ",
      "case_chapter_id": 1,
      "case_court_id": 221,
      "case_id_external": 458907,
      "case_no": "6:14-bk-63619",
      "case_petition_id": 1,
      "case_title": "Somewhere Someone",
      "case_type_id": 1,
      "cause": null,
      "ch11_type": null,
      "ch11_type_code": null,
      "chapter": 7,
      "court": "orbtrain",
      "court_name": "orbtrain",
      "created": "2018-09-25T17:09:34.803729Z",
      "date_closed": null,
      "date_discharged": null,
      "date_filed": "11/19/2014",
      "date_of_last_filing": null,
      "date_plan_confirmed": null,
      "date_terminated": null,
      "disabled": 0,
      "disposition": null,
      "has_asset": 0,
      "is_business_bankruptcy": 0,
      "judge_name": null,
      "jurisdiction": null,
      "jury_demand": null,
      "lead_case_uuid": null,
      "links": {
        "self": {
          "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619"
        }
      },
      "modified": "2018-09-25T17:13:45.986761Z",
      "nature_of_debt": null,
      "nature_of_suit_code": null,
      "ncl_parties": [],
      "referred_to": null,
      "schedule_ab": null,
      "timestamp": "2018-09-25T17:13:45.986760Z",
      "title": "Somewhere Someone",
      "uri_id": 85055150
    },
    "dockets": [
      {
        "annotations": [],
        "date_filed": "11/19/2014",
        "docket_no": 0,
        "docket_seq": 0,
        "docket_text": "Commencement of Case. (jrp) (Entered: 11/19/2014)",
        "has_pdf_link_on_pacer": false,
        "sequence_number": "0.00000",
        "timestamp": "2018-09-25T17:13:44.738708Z",
        "title": "Commencement of Case. (jrp) (Entered: 11/19/2014)"
      },
      {
        "annotations": [],
        "date_filed": "11/19/2014",
        "docket_no": "1",
        "docket_seq": 0,
        "docket_text": "Chapter 7 Voluntary Petition Filed by Somewhere Someone (jrp) (Entered: 11/19/2014)",
        "has_pdf_link_on_pacer": false,
        "sequence_number": "1.00000",
        "timestamp": "2018-09-25T17:13:44.738708Z",
        "title": "Chapter 7 Voluntary Petition Filed by Somewhere Someone (jrp) (Entered: 11/19/2014)"
      },
      {
        "annotations": [],
        "date_filed": "11/19/2014",
        "docket_no": "2",
        "docket_seq": 0,
        "docket_text": "Application to Pay Filing Fee in Installments Filed by Debtor Somewhere Someone (jrp) (Entered: 11/19/2014)",
        "has_pdf_link_on_pacer": false,
        "sequence_number": "2.00000",
        "timestamp": "2018-09-25T17:13:44.738708Z",
        "title": "Application to Pay Filing Fee in Installments Filed by Debtor Somewhere Someone (jrp) (Entered: 11/19/2014)"
      },
      {
        "annotations": [
          {
            "datetime": "2014-12-19",
            "highlight_phrase": "12/19/2014",
            "key_phrase": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due"
          },
          {
            "datetime": "2015-01-20",
            "highlight_phrase": "1/20/2015",
            "key_phrase": "2nd Installment Payment due"
          },
          {
            "datetime": "2015-02-17",
            "highlight_phrase": "2/17/2015",
            "key_phrase": "FINAL Installment Payment due"
          }
        ],
        "date_filed": "11/19/2014",
        "docket_no": 3,
        "docket_seq": 0,
        "docket_text": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due by 12/19/2014. 2nd Installment Payment due by 1/20/2015. FINAL Installment Payment due by 2/17/2015. (jrp) (Entered: 11/19/2014)",
        "has_pdf_link_on_pacer": true,
        "sequence_number": "3.00000",
        "timestamp": "2018-09-25T17:13:44.738708Z",
        "title": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due by 12/19/2014. 2nd Installment Payment due by 1/20/2015. FINAL Installment Payment due by 2/17/2015. (jrp) (Entered: 11/19/2014)"
      },
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
        "date_filed": "11/19/2014",
        "docket_no": "4",
        "docket_seq": 0,
        "docket_text": "Amended Order To Pay Filing Fees in Installments 1st Installment Payment due by 12/19/2014. FINAL Installment Payment due by 1/20/2015. (jrp) (Entered: 11/19/2014)",
        "has_pdf_link_on_pacer": false,
        "sequence_number": "4.00000",
        "timestamp": "2018-09-25T17:13:44.738708Z",
        "title": "Amended Order To Pay Filing Fees in Installments 1st Installment Payment due by 12/19/2014. FINAL Installment Payment due by 1/20/2015. (jrp) (Entered: 11/19/2014)"
      }
    ],
    "receipts": {
      "client_code": "",
      "cost": "0.10",
      "criteria": "14-63619-7 Fil or Ent: filed Doc From: 0 Doc To: 99999999 Term: included Format: html Page counts for documents: included",
      "datetime": "09/25/2018 10:13:45",
      "description": "Docket Report",
      "pages": "1",
      "timestamp": "2018-09-25T17:13:44.738708Z",
      "user_id": "irtraining"
    }
  }
```

Note that we have a receipt for the PACER charges in the response.

#### Update docket entries, including documents

Note that the above response does not include the docket `binder` attributes.
The default is to not return these.  However, you can enable this with the
`includeDocuments` form field.  If this field is passed (with a `true` value),
then the document information will be fetched and returned with the response.
This can make the docket update slower, but if your final intent is to buy or
download PDFs, you can request that here and avoid the need to make another API
call to `GET` the dockets again.  If you do not pass this value, the `binder`
information will still be fetched, but this happens in the background and the
response will not include the `binder`.

```javascript
  const queryApi = new CourtApi.QueryApi();

  const options = {
    includeDocuments: true
  };

  queryApi.updateDockets(courtCode, caseNumber, options, callback);
```

The response is identical to the previous `docket/update.js`, but docket
entries will have a `binder` now. This gives you everything you need to go
straight to the `order_pdf` step.

```javascript
  {
    "annotations": [
      {
        "datetime": "2014-12-19",
        "highlight_phrase": "12/19/2014",
        "key_phrase": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due"
      },
      {
        "datetime": "2015-01-20",
        "highlight_phrase": "1/20/2015",
        "key_phrase": "2nd Installment Payment due"
      },
      {
        "datetime": "2015-02-17",
        "highlight_phrase": "2/17/2015",
        "key_phrase": "FINAL Installment Payment due"
      }
    ],
    "binder": {
      "documents": [
        {
          "cost": "0.20",
          "description_html": null,
          "docket_no": 3,
          "filename": null,
          "free": null,
          "friendly_name": null,
          "links": {
            "order_pdf": {
              "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1"
            }
          },
          "number": 1,
          "pages": 2
        }
      ],
      "links": {
        "pacer-update": {
          "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents",
          "method": "POST"
        }
      }
    },
    "date_filed": "11/19/2014",
    "docket_no": 3,
    "docket_seq": 0,
    "docket_text": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due by 12/19/2014. 2nd Installment Payment due by 1/20/2015. FINAL Installment Payment due by 2/17/2015. (jrp) (Entered: 11/19/2014)",
    "has_pdf_link_on_pacer": true,
    "sequence_number": "3.00000",
    "timestamp": "2018-09-25T17:34:00.138926Z",
    "title": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due by 12/19/2014. 2nd Installment Payment due by 1/20/2015. FINAL Installment Payment due by 2/17/2015. (jrp) (Entered: 11/19/2014)"
  },
```

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
  $ docket/show-entry.js orbtrain 6:14-bk-63619 3.00000
```
```javascript
  {
    "entry": {
      "action": "https://ecf-train.orb.uscourts.gov/doc3/150014375608",
      "annotations": [
        {
          "datetime": "2014-12-19",
          "highlight_phrase": "12/19/2014",
          "key_phrase": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due"
        },
        {
          "datetime": "2015-01-20",
          "highlight_phrase": "1/20/2015",
          "key_phrase": "2nd Installment Payment due"
        },
        {
          "datetime": "2015-02-17",
          "highlight_phrase": "2/17/2015",
          "key_phrase": "FINAL Installment Payment due"
        }
      ],
      "binder": {
        "documents": [
          {
            "cost": "0.20",
            "description_html": null,
            "docket_no": 3,
            "filename": null,
            "free": null,
            "friendly_name": null,
            "links": {
              "order_pdf": {
                "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1"
              }
            },
            "number": 1,
            "pages": 2
          }
        ],
        "links": {
          "pacer-update": {
            "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents",
            "method": "POST"
          }
        }
      },
      "case_docket_entry_id": 81274896,
      "date_filed": "11/19/2014",
      "docket_no": 3,
      "docket_seq": "3.00000",
      "docket_text": "Order Granting 2 Application to Pay Filing Fee in Installments filed by Debtor Somewhere Someone 1st Installment Payment due by 12/19/2014. 2nd Installment Payment due by 1/20/2015. FINAL Installment Payment due by 2/17/2015. (jrp) (Entered: 11/19/2014)",
      "has_pdf_link_on_pacer": true,
      "links": {
        "documents": {
          "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents"
        },
        "self": {
          "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000"
        }
      },
      "timestamp": "2018-09-25T17:13:46.039520Z"
    },
    "links": {
      "header": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/header"
      },
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/update",
        "method": "POST"
      },
      "self": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000"
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
```
```javascript
  {
    "documents": [],
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/2.00000/documents",
        "method": "POST"
      }
    }
  }
```

If the `documents` list is empty, it means you need to update the document
entry from PACER using `updateDocketDocuments()` from the `QueryApi` (see the
next section).  It may also mean that there is no PDF available for this entry
on PACER.

If the document information has *already* been imported, the response looks
like this:

Example: Document Parts in CourtAPI
```shell
  $ docket/list-documents.js orbtrain 6:14-bk-63619 3.00000
```
```javascript
  {
    "documents": [
      {
        "cost": "0.20",
        "description_html": null,
        "docket_no": 3,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1"
          }
        },
        "number": 1,
        "pages": 2
      }
    ],
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents",
        "method": "POST"
      }
    }
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
```
```javascript
  {
    "documents": [
      {
        "cost": "0.20",
        "description_html": null,
        "docket_no": 3,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1"
          }
        },
        "number": 1,
        "pages": 2
      }
    ],
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents",
        "method": "POST"
      }
    }
  }
```

We can see that a document with 1 part and 2 pages is available now.  The
`documents.links.order_pdf.href` endpoint is the location where the PDF can be
purchased or downloaded.

However, not all docket entries have documents.  For example, consider the
following PACER request to update the docket entry documents:

Example Output: No Document Available
```shell
  $ docket/update-documents.js orbtrain 6:14-bk-63619 4.00000
  ERROR: 400
```
```javascript
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

Usage: `docket/show-document.js <court> <case number> <docket number> <document number>`

Example Output - Document Not Yet Purchased:
```shell
  $ docket/show-document.js orbtrain 6:14-bk-63619 3.00000 1
```
```javascript
  {
    "document": {},
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1",
        "method": "POST"
      }
    },
    "origin": "cache"
  }
```

The `document` section is empty, which indicates we need to purchase the document
from PACER, using the `update-pacer` link (see the next section).

Example Output - Document Already Purchased:
```shell
  $ docket/show-document.js orbtrain 6:14-bk-63619 3.00000 1
```
```javascript
  {
    "document": {
      "cost": "0.20",
      "description_html": null,
      "download_url": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/documents/docket/download/eyJ...",
      "filename": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "friendly_name": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "number": 1,
      "pages": 2
    },
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1",
        "method": "POST"
      }
    },
    "origin": "cache"
  }
```

At that point, the PDF can be downloaded at the `document.download_url` and saved
wherever you want.  Suggested filenames are available in the `document.filename`
and `document.friendly_name` fields.

Example Output - No Document Available:
```
  $ docket/show-document.js orbtrain 6:14-bk-63619 4.00000 1
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
```
```javascript
  {
    "document": {
      "action": "https://ecf-train.orb.uscourts.gov/doc3/150114375608?caseid=458907",
      "cost": "0.20",
      "description_html": null,
      "docket_no": "3.00000",
      "download_url": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/documents/docket/download/eyJ...",
      "filename": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "free": null,
      "friendly_name": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
      "number": 1,
      "ocr_link": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/documents/docket/download/eyJ...",
      "pages": 2,
      "sequence_number": "3.00000"
    },
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/orbtrain/6:14-bk-63619/dockets/3.00000/documents/1",
        "method": "POST"
      }
    },
    "origin": "PACER",
    "receipt": {
      "meta": {
        "case_uuid": null,
        "timestamp": null
      },
      "text": {
        "client_code": "",
        "cost": "0.20",
        "criteria": "14-63619-7",
        "datetime": "Tue Sep 25 10:54:43 2018",
        "description": "Image:3-0",
        "pages": "2",
        "user_id": "[your pacer username]"
      }
    }
  }
```

At this point, we have everything we need to save the PDF.  The document can be
downloaded at the `document.download_url` location, and either saved locally using
whatever filename you want, or, using the `document.filename` or
`document.friendly_name` suggestions.

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
            "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/dockets"
          },
          "self": {
            "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012"
          }
        },
        "timestamp": "2018-09-25T18:07:51.576700Z",
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
  No docket entries - No matches, or PACER update needed
```

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
        "binder": {
          "documents": [
            {
              "cost": "0.30",
              "description_html": "Claim 51742-0",
              "docket_no": null,
              "filename": null,
              "free": null,
              "friendly_name": null,
              "links": {
                "order_pdf": {
                  "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1"
                }
              },
              "number": 1,
              "pages": 3
            }
          ],
          "links": {
            "pacer-update": {
              "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
              "method": "POST"
            }
          }
        },
        "claim_date": "06/11/2007",
        "claim_no": "1-1",
        "claim_seq": "1-1.00000",
        "claim_text": "06/11/2007 Claim #1 filed by Bloomingdales, Amount claimed: $160.00 (Fouche, Cindy)",
        "links": {
          "documents": {
            "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000"
          }
        }
      }
    ],
    "info": {
      "claim_no": 1,
      "modified": "2018-09-25T18:21:54.195020Z",
      "original_entered_date": "06/11/2007",
      "original_filed_date": "06/11/2007"
    },
    "links": {
      "self": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1"
      }
    },
    "remarks": null,
    "status": null
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
```
```javascript
  {
    "case": {
      "appeal_case_uuid": null,
      "assets": "Unknown",
      "assigned_to": null,
      "case_chapter_id": 3,
      "case_court_id": 107,
      "case_id_external": 2644,
      "case_no": "2:07-bk-00012",
      "case_petition_id": 1,
      "case_title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "case_type_id": 1,
      "cause": null,
      "ch11_type": null,
      "ch11_type_code": null,
      "chapter": 11,
      "court": "azbtest",
      "court_name": "azbtest",
      "created": "2018-09-25T18:07:51.576699Z",
      "date_closed": null,
      "date_discharged": null,
      "date_filed": "02/19/2007",
      "date_of_last_filing": "09/25/2018",
      "date_plan_confirmed": "07/30/2007",
      "date_terminated": null,
      "disabled": 0,
      "disposition": null,
      "has_asset": 1,
      "is_business_bankruptcy": null,
      "judge_name": "Brenda Moody Whinery",
      "jurisdiction": null,
      "jury_demand": null,
      "lead_case_uuid": null,
      "links": {
        "self": {
          "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012"
        }
      },
      "modified": "2018-09-25T18:09:51.887193Z",
      "nature_of_debt": null,
      "nature_of_suit_code": null,
      "ncl_parties": [],
      "referred_to": null,
      "schedule_ab": null,
      "timestamp": "2018-09-25T18:09:51.887190Z",
      "title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "uri_id": 85055162
    },
    "claims": [
      {
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
        "claim_no": "1",
        "creditor": "Bloomingdales\nPO Box 8745\nNew York NY 10012-8745",
        "description": "(1-1) test<BR>",
        "history": [
          {
            "claim_date": "06/11/2007",
            "claim_history_no": "1",
            "claim_no": "1-1",
            "claim_seq": 0,
            "claim_text": "Claim #1 filed by Bloomingdales, Amount claimed: $160.00 (Fouche, Cindy)",
            "history_no": 1,
            "sequence_number": "1.00000"
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
        },
        "timestamp": "2018-09-25T18:21:52.944572Z"
      }
    ],
    "receipts": {
      "client_code": "",
      "cost": "0.10",
      "criteria": "2:07-bk-00012-BMW",
      "datetime": "09/25/2018 11:21:54",
      "description": "Claims Register",
      "filename": "azbtest_2644",
      "pages": "1",
      "timestamp": "2018-09-25T18:21:52.944572Z",
      "user_id": "[ pacer user ]"
    }
  }
```

Note that we have a receipt for the PACER charges in the response.

#### Update Claims Entries, including Docments

Just like the `dockets` update endpoint, the claims update endpoint has an
option to fetch the PDF information and return it in the claim history entry
`binder` attributes.

Sample Code:
```javascript
  const queryApi = new CourtApi.QueryApi();

  const options = {
    includeDocuments: true
  };

  // you can restrict what claims are fetched with an options argument,
  // or just use "null" to get the entire claims register
  queryApi.updateClaims(court, caseNumber, options,
    function (error, data, response) {
      console.log(JSON.stringify(response.body, null, 2));
    }
  );
```

Example:
```shell
  $ claim/update.js azbtest 2:07-bk-00012 1
```

Response:
```javascript
  {
    "case": {
      "appeal_case_uuid": null,
      "assets": "Unknown",
      "assigned_to": null,
      "case_chapter_id": 3,
      "case_court_id": 107,
      "case_id_external": 2644,
      "case_no": "2:07-bk-00012",
      "case_petition_id": 1,
      "case_title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "case_type_id": 1,
      "cause": null,
      "ch11_type": null,
      "ch11_type_code": null,
      "chapter": 11,
      "court": "azbtest",
      "court_name": "azbtest",
      "created": "2018-09-25T18:07:51.576699Z",
      "date_closed": null,
      "date_discharged": null,
      "date_filed": "02/19/2007",
      "date_of_last_filing": "09/25/2018",
      "date_plan_confirmed": "07/30/2007",
      "date_terminated": null,
      "disabled": 0,
      "disposition": null,
      "has_asset": 1,
      "is_business_bankruptcy": null,
      "judge_name": "Brenda Moody Whinery",
      "jurisdiction": null,
      "jury_demand": null,
      "lead_case_uuid": null,
      "links": {
        "self": {
          "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012"
        }
      },
      "modified": "2018-09-25T18:09:51.887193Z",
      "nature_of_debt": null,
      "nature_of_suit_code": null,
      "ncl_parties": [],
      "referred_to": null,
      "schedule_ab": null,
      "timestamp": "2018-09-25T18:09:51.887190Z",
      "title": "Joseph Wayne Sample and Sarah Lynn Sample",
      "uri_id": 85055162
    },
    "claims": [
      {
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
        "claim_no": "1",
        "creditor": "Bloomingdales\nPO Box 8745\nNew York NY 10012-8745",
        "description": "(1-1) test<BR>",
        "history": [
          {
            "binder": {
              "documents": [
                {
                  "cost": "0.30",
                  "description_html": "Claim 51742-0",
                  "docket_no": null,
                  "filename": null,
                  "free": null,
                  "friendly_name": null,
                  "links": {
                    "order_pdf": {
                      "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1"
                    }
                  },
                  "number": 1,
                  "pages": 3
                }
              ],
              "links": {
                "pacer-update": {
                  "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
                  "method": "POST"
                }
              }
            },
            "claim_date": "06/11/2007",
            "claim_history_no": "1",
            "claim_no": "1-1",
            "claim_seq": 0,
            "claim_text": "Claim #1 filed by Bloomingdales, Amount claimed: $160.00 (Fouche, Cindy)",
            "history_no": 1,
            "sequence_number": "1.00000"
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
        },
        "timestamp": "2018-09-25T18:28:29.404530Z"
      }
    ],
    "receipts": {
      "client_code": "",
      "cost": "0.10",
      "criteria": "2:07-bk-00012-BMW",
      "datetime": "09/25/2018 11:28:30",
      "description": "Claims Register",
      "filename": "azbtest_2644",
      "pages": "1",
      "timestamp": "2018-09-25T18:28:29.404530Z",
      "user_id": "[ pacer user ]"
    }
  }
```

Note that this response is identical to the previous update, except the claim
history entries include the `binder` attribute which contains everything needed
to go straight to the `order_pdf` step.  If your final intent is to download or
purchase a PDF, this is the quickest way to get there.

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
```
```javascript
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
          "binder": {
            "documents": [
              {
                "cost": "0.30",
                "description_html": "Claim 51742-0",
                "docket_no": null,
                "filename": null,
                "free": null,
                "friendly_name": null,
                "links": {
                  "order_pdf": {
                    "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1"
                  }
                },
                "number": 1,
                "pages": 3
              }
            ],
            "links": {
              "pacer-update": {
                "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
                "method": "POST"
              }
            }
          },
          "claim_date": "06/11/2007",
          "claim_no": "1-1",
          "claim_seq": "1-1.00000",
          "claim_text": "06/11/2007 Claim #1 filed by Bloomingdales, Amount claimed: $160.00 (Fouche, Cindy)",
          "links": {
            "documents": {
              "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000"
            }
          }
        }
      ],
      "info": {
        "claim_no": 1,
        "modified": "2018-09-25T18:28:30.704570Z",
        "original_entered_date": "06/11/2007",
        "original_filed_date": "06/11/2007"
      },
      "links": {
        "self": {
          "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1"
        }
      },
      "remarks": null,
      "status": null
    },
    "links": {
      "header": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/header"
      },
      "self": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1"
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
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/header"
      },
      "self": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/2"
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
```
```javascript
  {
    "documents": [],
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
        "method": "POST"
      }
    }
  }
```

Note that the `documents` array is empty, indicating that a PACER update is needed,
or, that there are no documents available for this entry.

Example: Document Already Imported
```shell
  $ claim/list-parts.js azbtest 2:07-bk-00012 1 1.00000
```
```javascript
  {
    "documents": [
      {
        "cost": "0.30",
        "description_html": "Claim 51742-0",
        "docket_no": null,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1"
          }
        },
        "number": 1,
        "pages": 3
      }
    ],
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
        "method": "POST"
      }
    }
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

Usage: `claim/update-documents.js <court> <case number> <claim number> <claim sequence>`

Example:
```shell
  $ claim/update-documents.js azbtest 2:07-bk-00012 1 1.00000
```
```javascript
  {
    "documents": [
      {
        "cost": "0.30",
        "description_html": "Claim 51742-0",
        "docket_no": null,
        "filename": null,
        "free": null,
        "friendly_name": null,
        "links": {
          "order_pdf": {
            "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1"
          }
        },
        "number": 1,
        "pages": 3
      }
    ],
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000",
        "method": "POST"
      }
    }
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

Usage: `claim/show-document.js <court> <case> <claim> <claim sequence> <part>`

Example: Document not yet purchased from PACER
```shell
  $ claim/show-document.js azbtest 2:07-bk-00012 1 1.00000 1
```
```javascript
  {
    "document": {},
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1",
        "method": "POST"
      }
    },
    "origin": "cache"
  }
```

The origin here was `cache` (meaning the local database), and the `document`
section is empty, so we know that we need to purchase the PDF from PACER.

Example: Document Already Purchased from PACER
```shell
  $ claim/show-document.js azbtest 2:07-bk-00012 1 1.00000 1
```
```javascript
  {
    "document": {
      "cost": "0.30000",
      "description_html": "Claim 51742-0",
      "download_url": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/documents/claims/download/eyJ...",
      "filename": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "friendly_name": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "number": 1,
      "pages": 3
    },
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1",
        "method": "POST"
      }
    },
    "origin": "cache"
  }
```

In this example the document was already present on CourtAPI, and can be
downloaded at the location in `document.download_url` and saved in a filename of
your choice, or, using the suggested filename of either `document.filename` or
`document.friendly_name`.

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
  $ claim/buy-document.js azbtest 2:07-bk-00012 1 1.00000 1
```
```javascript
  {
    "document": {
      "action": "https://ecf-test.azb.uscourts.gov/doc2/02418759",
      "cost": "0.30",
      "description_html": "Claim 51742-0",
      "docket_no": "1-1.00000",
      "download_url": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/documents/claims/download/eyJ...",
      "filename": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "friendly_name": "Bankr.D.Ariz.TEST_2-07-bk-00012_Claim_1-1.pdf",
      "history_number": "1",
      "number": 1,
      "ocr_link": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/documents/claims/download/eyJ...",
      "pages": 3
    },
    "links": {
      "pacer-update": {
        "href": "https://train.v1.courtapi.com/cases/pacer/azbtest/2:07-bk-00012/claims/1/documents/1.00000/1",
        "method": "POST"
      }
    },
    "origin": "PACER",
    "receipt": {
      "client_code": "",
      "cost": "0.30",
      "criteria": "2:07-bk-00012-BMW",
      "datetime": "Tue Sep 25 11:42:14 2018",
      "description": "Claim 51742-0",
      "pages": "3",
      "timestamp": null,
      "user_id": "[ pacer user ]"
    }
  }
```

Notice here that we have a receipt for the PACER charges, as well as all of the
information we need to download the PDF and save it locally.  The PDF can be
downloaded from the `document.download_url` location in the response, and either
saved in a filename of your own choice, or, using the suggested filenames in
`document.filename` or `document.friendly_name`.

# Complete Example: Generate a Complete Docket Sheet for a Case

The NodeJS program `make-docket-sheet.js` is a complete example that does all
of the following things:

- Searches for a case on CourtAPI
- If not found, imports the case into CourtAPI from PACER
- Purchases and updates the docket from PACER if necessary
- Prints the case header and all docket entries to an output file

Example Usage:

```javascript
  $ make-docket-sheet.js orbtrain 6:14-bk-63619
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
  $ make-claims-register.js azbtest 2:07-bk-00012
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
  $ purchase-and-download-docket-pdfs.js orbtrain 6:14-bk-63619 jrp
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

## Advanced Filings Search

Endpoint: `GET /cases/pacer/search-filings`

Usage: `./pacer/search-filings.sh <case_uuid>`

Example Usage:
```shell
 $ pacer/search-filings.js nysbke_247775
``` 
```javascript
{
  "facets" => {
    "chapter" => {
      "11" => 1023
    },
    "court" => {
      "nysbke" => 1023
    },
    "date_filed" => {
      "2014" => 1023
    },
    "judge_name" => {
      "Martin Glenn" => 1023
    },
    "nature_of_suit" => []
  },
  "num_cases" => 1,
  "num_found" => 1023,
  "page_count" => 1,
  "results" => [
    {
      "appeal_case_uuid" => undef,
      "assets" => "Unknown",
      "assigned_to" => undef,
      "case_assets" => "Unknown",
      "case_chapter" => 11,
      "case_chapter_id" => 3,
      "case_court" => "nysbke",
      "case_court_id" => 72,
      "case_date_filed" => "03/10/2014",
      "case_id" => 3098692,
      "case_id_external" => 247775,
      "case_judge_name" => "Martin Glenn",
      "case_liabilities" => "Unknown",
      "case_naics_code" => undef,
      "case_nature_of_suit_code" => undef,
      "case_no" => "1:14-bk-10557",
      "case_petition_id" => 1,
      "case_title" => "Sbarro LLC",
      "case_type" => "bk",
      "case_type_id" => 1,
      "cause" => undef,
      "ch11_type" => undef,
      "ch11_type_code" => undef,
      "chapter" => 11,
      "court" => "nysbke",
      "court_code" => [
        "ny",
        "nys",
        "02"
      ],
      "court_name" => "nysbke",
      "created" => "2014-03-10T12:59:56.335718Z",
      "date_closed" => undef,
      "date_discharged" => undef,
      "date_filed" => "03/10/2014",
      "date_of_last_filing" => undef,
      "date_plan_confirmed" => undef,
      "date_terminated" => undef,
      "disposition" => undef,
      "document_type" => "cases",
      "has_asset" => bless( do{\(my $o = 0)}, 'JSON::PP::Boolean' ),
      "id" => "cases:nysbke_247775",
      "industry" => undef,
      "inner_hits" => "1023 matches",
      "is_business_bankruptcy" => bless( do{\(my $o = 1)}, 'JSON::PP::Boolean' ),
      "join" => {
        "name" => "cases"
      },
      "judge_name" => "Martin Glenn",
      "jurisdiction" => undef,
      "jury_demand" => undef,
      "lead_case_uuid" => undef,
      "liabilities" => "Unknown",
      "links" => {
        "self" => {
          "href" => "http://127.0.0.1:43959/cases/pacer/nysbke/1:14-bk-10557"
        }
      },
      "modified" => "2017-07-09T05:13:32.653406Z",
      "naics_code" => undef,
      "nature_of_debt" => "Business",
      "nature_of_suit_code" => undef,
      "ncl_parties" => [
        {
          "name" => "Sbarro LLC",
          "role" => "db"
        },
        {
          "name" => "New Sbarro LLC",
          "role" => "db"
        },
        {
          "name" => "Belmonte, Christopher Robert",
          "role" => "aty"
        }
      ],
      "query" => "cases",
      "referred_to" => undef,
      "schedule_ab" => undef,
      "title" => "Sbarro LLC",
      "type_code" => 0,
      "website" => undef
    }
  ]
}
```
