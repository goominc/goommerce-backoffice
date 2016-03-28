
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
          [0, 'desc'],
        ], // set first column as a default sort by desc
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

directiveModule.directive('boDatatables', ($http, $compile, $parse, datatableCommons) => {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    link: (scope, elem, attr) => {
      const dataTables = $parse(attr.boDatatables)(scope);
      const handleData = (realData) => {
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
      };
      if (dataTables.data) {
        handleData(dataTables.data);
      } else {
        $http.get(dataTables.url).then((res) => {
          if (dataTables.field && dataTables.field !== '') {
            handleData(res.data[dataTables.field]);
          } else {
            handleData(res.data);
          }
        });
      }
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

      const dataTables = scope.boServerDatatables;
      const options = datatableCommons.getOptions(scope, dataTables);
      options.serverSide = true;
      options.ajax = (data, callback, settings) => {
        // console.log(data);
        const urlParams = { ...scope.urlParams };
        urlParams.offset = data.start;
        urlParams.limit = data.length;
        if (data.search.value) {
          urlParams.q = data.search.value;
        }
        const order = _.get(data, 'order[0]');
        if (order) {
          const column = options.columns[order.column].data;
          if (_.isString(column)) {
            urlParams.sorts = order.dir === 'desc' ? `-${column}` : column;
          } else {
            console.log('column is not String. cannot sort');
          }
        }
        const url = boUtils.encodeQueryData(urlBase, urlParams);
        $http.get(url).then((value) => {
          let serverData = value.data;
          if (dataTables['field']) {
            serverData = serverData[dataTables['field']];
          }
          if (!serverData) {
            serverData = [];
          }
          const pageInfo = {data: serverData, draw: data.draw};
          pageInfo.recordsTotal = _.get(value, 'data.pagination.total') || 0;
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

directiveModule.directive('clUploadWidget', function () {
  return {
    restrict: 'A',
    scope: {
      callback: '&callback',
    },
    link: function (scope, elem) {
      elem.click(function() {
        cloudinary.openUploadWidget({
          cloud_name: 'linkshops',
          upload_preset: 'nd9k8295',
          multiple: false,
        }, function(error, result) {
          if (!error) {
            if (scope.callback) {
              scope.callback(
                {result: result[0]}
              );
            }
            scope.$apply();
          }
        });
      });
    },
  };
});

directiveModule.directive('boFileReader', () => {
  return {
    restrict: 'A',
    scope: {
      onRead:'&onRead',
    },
    link: function(scope, element) {
      $(element).on('change', function(changeEvent) {
        const files = changeEvent.target.files;
        if (files.length) {
          const r = new FileReader();
          r.onload = function(e) {
            const contents = e.target.result;
            if (scope.onRead) {
              scope.onRead({ contents: contents });
            }
            scope.$apply();
          };

          r.readAsText(files[0], 'EUC-KR'); // 2016. 01. 28. [heekyu] april send me EUC-KR encoded files
        }
      });
    },
  };
});
