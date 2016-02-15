// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

productModule.controller('ProductMainController', ($scope, $http, $state, $rootScope, $translate, boConfig) => {
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

  $scope.productDatatables = {
    field: 'products',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: boConfig.apiUrl + '/api/v1/products',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="product.edit({productId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: 'sku',
      },
      {
        data: 'id',
        render: (id) => {
          return `<button data-ng-click="deleteProduct(${id})" class="btn red"><i class="fa fa-remove"></i> ${$translate.instant('main.deleteButton')}</button>`;
        },
      },
    ],
  };
  $scope.fileContents = 'before';

  $scope.deleteProduct = (productId) => {
    if (window.confirm(`Really delete product (${productId})?`)) {
      $http.delete(`/api/v1/products/${productId}`).then(() => {
        // reload
        $state.reload(true);
      }).catch((err) => {
        window.alert(err);
      });
    }
  };
});
