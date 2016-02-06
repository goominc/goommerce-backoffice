// Copyright (C) 2016 Goom Inc. All rights reserved.

const brandModule = require('./module');

brandModule.controller('BrandMainController', ($scope, $http, $element, boUtils) => {
  const brandsUrl = '/api/v1/brands';
  const fieldName = 'brands';
  $scope.brandDatatables = {
    field: fieldName,
    url: brandsUrl,
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="brand.info({brandId: ${id}})">${id}</a>`;
        },
      },
      {
        data: 'pathname',
      },
    ],
  };

  $scope.createBrand = (brand) => {
    $http.post(brandsUrl, brand).then((res) => {
      $scope.closeBrandPopup();
      boUtils.refreshDatatableAjax(brandsUrl, $($element), fieldName);
    }).catch((err) => {
      console.log(err);
    });
  };

  $scope.closeBrandPopup = () => {
    $('#new_brand_modal').modal('hide');
  };
});
