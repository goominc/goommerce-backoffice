
const directiveModule = angular.module('backoffice.directives', [
  require('../utils/module').name,
]);

module.exports = directiveModule;

directiveModule.factory('datatableCommons', ($compile) => {
  return {
    getOptions: (scope, dataTables) => {
      const options = {
        lengthMenu: [
          [10, 20, 50, 100, 150],
          [10, 20, 50, 100, 150],  // change per page values here
        ],
        pageLength: 50, // default record count per page
        // data: realData, need implement
        columns: dataTables.columns,
        order: dataTables.order || [
          [0, 'asc'],
        ], // set first column as a default sort by asc
        fnCreatedRow: (nRow) => {
          $compile(nRow)(scope);
        },
        fnRowCallback: (nRow, aData) => {
          $(nRow).attr("id", aData.id);
        },
        orderCellsTop: true,
      };
      if (dataTables.data) {
        options.data = dataTables.data;
      }
      if (dataTables.disableFilter) {
        options.bFilter = false;
      }
      return options;
    },
  };
});

directiveModule.directive('boDatatables', ($compile, $parse, datatableCommons) => {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    link: (scope, elem, attr) => {
      const dataTables = $parse(attr.boDatatables)(scope);
      const data = dataTables.data || $.get(dataTables.url).then((realData) => {
          return realData[dataTables.field];
        });
      $.when(data).then((realData) => {
        if (realData) {
          realData.forEach(function (elem, index) {
            elem._index = index;
          });
        }
        dataTables.data = realData;
        const options = datatableCommons.getOptions(scope, dataTables);
        if (dataTables.hasOwnProperty('bSort')) {
          options.bSort = dataTables.bSort;
        }
        elem.find('table').dataTable(options);
        if (dataTables.rowReorder) {
          table.rowReordering();
        }
        if (attr.directiveLoad && scope[attr.directiveLoad]) {
          scope[attr.directiveLoad]();
        }
      });
    },
  };
});

directiveModule.directive('boServerDatatables', ($http, datatableCommons, boUtils) => {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    scope: {
      url: '@',
      urlParams: '=',
      boServerDatatables: '=',
      tableRender: '&',
    },
    link: (scope, elem) => {
      const urlBase = scope.url;
      let urlParams = scope.urlParams;
      if (!urlParams) {
        urlParams = {};
      }

      const dataTables = scope.boServerDatatables;
      const options = datatableCommons.getOptions(scope, dataTables);
      options.serverSide = true;
      options.ajax = (data, callback, settings) => {
        urlParams.offset = data.start;
        urlParams.limit = data.length;
        const url = boUtils.encodeQueryData(urlBase, urlParams);
        $http.get(url).then((value) => {
          let serverData = value.data[dataTables['field']];
          if (!serverData) {
            serverData = [];
          }
          const pageInfo = {data: serverData, draw: data.draw};
          pageInfo.recordsTotal = serverData.total;
          // TODO really filtered data
          pageInfo.recordsFiltered = pageInfo.recordsTotal;
          callback(pageInfo);
          if (scope.tableRender) {
            scope.tableRender();
          }
        });
      };
      elem.find('table').dataTable(options);
    },
  }
});
