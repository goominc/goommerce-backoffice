
const utilModule = angular.module('backoffice.utils', []);

utilModule.factory('boUtils', ($http) => {
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
    },
    refreshDatatableAjax: (url, elem, dataKey) => {
      $http.get(url).then((res) => {
        let table = elem.find('table').dataTable();
        table.fnClearTable();
        if (res.data && res.data[dataKey]) {
          table.fnAddData(res.data[dataKey]);
        }
        table.fnDraw();
      });
    },
  };
});

module.exports = utilModule;
