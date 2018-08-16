//
// Authentication Helper for CourtAPI examples
//

var CourtApi = require('court_api');
var constants = require('./constants');

module.exports = {
  init: function() {
    var auth = CourtApi.ApiClient.instance.authentications['www-authenticate'];
    auth.username = constants.API_KEY;
    auth.password = constants.API_SECRET;

    // To use an alternate host, change the basePath
    //CourtApi.ApiClient.instance.basePath = 'http://courtapi.inforuptcy.dev.azk.io';
  }
};
