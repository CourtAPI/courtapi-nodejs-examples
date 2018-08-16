//
// Handlers module for CourtAPI examples
//
module.exports = {
  errorHandler: function (error) {
    console.error("ERROR: " + error.status);
    console.error(JSON.stringify(error.response.body, null, 2));
    process.exit(-1);
  },
  promiseCallback: function (resolve, reject) {
    return function (error, data, response) {
      if (error)
        reject(error.response.body);
      else
        resolve(response.body);
    }
  }
};
