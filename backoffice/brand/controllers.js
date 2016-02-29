// Copyright (C) 2016 Goom Inc. All rights reserved.

const brandModule = require('./module');

brandModule.factory('brandCommons', ($http) => {
  return {
    saveBrand: (brand) => {
      const brandsUrl = '/api/v1/brands';
      let promise = null;
      brand.pathname += `/bo/brand/${brand.data.name.en}`;
      const brandFields = ['pathname', 'data'];
      if (brand.id) {
        promise = $http.put(`brandsUrl/${brand.id}`, _.pick(brand, brandFields));
      } else {
        promise = $http.post(brandsUrl, _.pick(brand, brandFields));
      }
      return promise.then((res) => {
        $http.put(`/api/v1/brands/${res.data.id}/index`).then(() => {
          // ignore
        });
        return res;
      });
    },
  };
});

brandModule.controller('BrandMainController', ($scope, $http, $element, brandCommons, boUtils) => {
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
        data: 'data.name.ko',
      },
    ],
  };

  $scope.createBrand = (brand) => {
    brandCommons.saveBrand(brand).then(() => {
      $scope.closeBrandPopup();
      $scope.newBrand.data.name = {};
      boUtils.refreshDatatableAjax(brandsUrl, $($element), fieldName);
    }).catch((err) => {
      let message = err.data.message;
      if (!message) {
        message = 'ERROR Occurred';
      }
      window.alert(message);
    });
  };

  $scope.newBrand = {
    data: { name: {} },
  };

  $scope.closeBrandPopup = () => {
    $('#new_brand_modal').modal('hide');
  };
});
