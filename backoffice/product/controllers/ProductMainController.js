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

  const cookieKey = 'state.product.main';
  boUtils.initDateBetween($('#product_createdAt_start'), $('#product_createdAt_end'), $state, cookieKey);

  $scope.startDate = _.get($rootScope, `${cookieKey}.startDate`) || '';
  $scope.endDate =_.get($rootScope, `${cookieKey}.endDate`) || '';
  if ($scope.startDate && $scope.endDate && new Date($scope.startDate).getTime() > new Date($scope.endDate).getTime()) {
    window.alert('시작 날짜가 종료 날짜와 같거나 더 작아야 합니다');
  }

  $scope.productIdMap = {};

  $scope.productDatatables = {
    field: 'products',
    storeKey: 'products', // 2016. 05. 24. [heekyu] Case 262
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
        data: (product) => product,
        orderable: false,
        render: (product) => {
          const brandId = _.get(product, 'brand.id');
          const brandName = _.get(product, 'brand.name.ko') || '';
          if (!brandId) return brandName;
          return `<a ui-sref="brand.edit({brandId: ${brandId}})">${brandName}</a>`;
        },
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
        data: (product) => product,
        orderable: false,
        render: (product) => {
          $scope.productIdMap[product.id] = product;
          return `
            <input type="checkbox" id="product_main_isActive_${product.id}"
              data-ng-checked="${product.isActive}"
              data-ng-click="toggleIsActive(productIdMap[${product.id}])"
            />
            <label for="product_main_isActive_${product.id}"></label>
          `;
        },
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
  $scope.toggleIsActive = (product) => {
    $http.put(`/api/v1/products/${product.id}`, { isActive: !product.isActive }).then(() => {
      product.isActive = !product.isActive;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      $http.put(`/api/v1/products/${product.id}/index`);
    }, () => {
      window.alert('failed to update isActive');
    });
  };
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

  $scope.fnUrlParams = (urlParams) => {
    if (!$scope.startDate || !$scope.endDate) {
      return;
    }
    const start = new Date($scope.startDate);
    const end = new Date($scope.endDate);
    const diff = end.getTime() - start.getTime();
    if (diff >= 0) {
      urlParams.start = $scope.startDate;
      urlParams.end = $scope.endDate;
    }
  };
});
