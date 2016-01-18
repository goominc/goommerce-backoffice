
const utilModule = angular.module('backoffice.utils', []);

utilModule.factory('boUtils', () => {
  return {
    // http://stackoverflow.com/questions/111529/create-query-parameters-in-javascript
    encodeQueryData : (url, data) => {
      var ret = [];
      for (var d in data) {
        if (data.hasOwnProperty(d)) {
          ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        }
      }
      return url + '?' + ret.join("&");
    }
  };
});

module.exports = utilModule;
