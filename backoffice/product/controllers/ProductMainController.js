// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

productModule.controller('ProductMainController', ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) => {
  $scope.contentTitle = $translate.instant('product.main.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'product.main',
      name: $translate.instant('product.main.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  const storeKey = 'products';
  $scope.productDatatables = {
    field: 'products',
    storeKey, // 2016. 05. 24. [heekyu] Case 262
    // disableFilter: true,
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="product.edit({productId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: (product) => _.get(product, 'name.ko') || '',
        orderable: false,
      },
      {
        data: (product) => _.get(product, 'brand.name.ko') || '',
        orderable: false,
      },
      {
        data: (product) => product.sku || '',
        orderable: false,
      },
      {
        data: (product) => boUtils.formatDate(product.createdAt),
        orderable: false,
      },
      {
        data: 'id',
        orderable: false,
        render: (id) => {
          return `<button data-ng-click="deleteProduct(${id})" class="btn red"><i class="fa fa-remove"></i> ${$translate.instant('main.deleteButton')}</button>`;
        },
      },
    ],
  };
  if ($rootScope.state.datatables[storeKey]) {
    $scope.productDatatables.oSearch = { sSearch: $rootScope.state.datatables[storeKey] };
  }
  $scope.datatablesLoaded = () => {
    $compile(angular.element($('table')))($scope);
  };
  $scope.fileContents = 'before';

  $scope.deleteProduct = (productId) => {
    if (window.confirm(`Really delete product (${productId})?`)) {
      $http.delete(`/api/v1/products/${productId}`).then(() => {
        $http.put(`/api/v1/products/${productId}/index`).then(() => {
          setTimeout(() => {
            $state.reload();
          }, 1000); // wait 1 sec for elasticsearch update
        });
      }).catch((err) => {
        window.alert(err);
      });
    }
  };
});
