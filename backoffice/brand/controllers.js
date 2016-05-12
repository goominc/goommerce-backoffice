// Copyright (C) 2016 Goom Inc. All rights reserved.

const brandModule = require('./module');

brandModule.factory('brandCommons', ($http) => {
  return {
    saveBrand: (brand) => {
      const brandsUrl = '/api/v1/brands';
      let promise = null;
      const brandFields = ['pathname', 'name'];
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
          return `<a ui-sref="brand.edit({brandId: ${id}})">${id}</a>`;
        },
      },
      {
        data: 'name.ko',
        orderable: false,
      },
    ],
  };

  $scope.createBrand = (brand) => {
    brandCommons.saveBrand(brand).then(() => {
      $scope.closeBrandPopup();
      $scope.newBrand.name = {};
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
    name: {},
  };

  $scope.closeBrandPopup = () => {
    $('#new_brand_modal').modal('hide');
  };
});

brandModule.controller('BrandEditController', ($scope, $http, $state, $rootScope, $translate, boUtils, convertUtil) => {
  const initFields = () => {
    if (!$scope.brand.data) {
      $scope.brand.data = {};
    }
    $scope.brandFields1 = [
      {title: 'ID', key: 'id', obj: $scope.brand.id, isReadOnly: true},
      {title: $translate.instant('brand.edit.nameLabel'), obj: _.get($scope.brand, 'name.ko'), key: 'name.ko'},
    ];
    $scope.brandFields2 = [
      {title: $translate.instant('brand.edit.buildingFloorLabel'), obj: _.get($scope.brand, 'data.location.floor'), key: 'data.location.floor'},
      {title: $translate.instant('brand.edit.buildingFlatNumberLabel'), obj: _.get($scope.brand, 'data.location.flatNumber'), key: 'data.location.flatNumber'},
      {title: $translate.instant('brand.edit.bizNameLabel'), obj: _.get($scope.brand, 'data.businessRegistration.name'), key: 'data.businessRegistration.name'},
      {title: $translate.instant('brand.edit.bizNumberLabel'), obj: _.get($scope.brand, 'data.businessRegistration.number'), key: 'data.businessRegistration.number'},
      {title: $translate.instant('brand.edit.accountBankLabel'), obj: _.get($scope.brand, 'data.bank.name'), key: 'data.bank.name'},
      {title: $translate.instant('brand.edit.accountOwnerLabel'), obj: _.get($scope.brand, 'data.bank.accountHolder'), key: 'data.bank.accountHolder'},
      {title: $translate.instant('brand.edit.accountNumberLabel'), obj: _.get($scope.brand, 'data.bank.accountNumber'), key: 'data.bank.accountNumber'},
      // {title: $translate.instant('brand.edit.buildingNameLabel'), obj: _.get($scope.brand, 'data.location.name'), key: 'data.location.name'},
      {title: $translate.instant('brand.edit.telLabel'), obj: _.get($scope.brand, 'data.tel'), key: 'data.tel'},
      {title: $translate.instant('brand.edit.mobileLabel'), obj: _.get($scope.brand, 'data.mobile'), key: 'data.mobile'},
    ];

    $scope.buildingMap = {};
    $scope.buildings = [];
    $scope.buildingId = (_.get($scope.brand, 'data.location.building.id') || "0").toString();
    $http.get('/api/v1/buildings').then((res) => {
      $scope.buildings = res.data.buildings || [];
      $scope.buildings.forEach((building) => {
        building.id = +building.id;
        $scope.buildingMap[building.id] = building;
      });
    });
  };

  if ($state.params.brandId) {
    boUtils.startProgressBar();
    $http.get(`/api/v1/brands/${$state.params.brandId}/unmodified`).then((res) => {
      $scope.brand = res.data;
      initFields();
      boUtils.stopProgressBar();
    }, () => {
      window.alert(`failed to get brand (${$state.params.brandId})`);
      boUtils.stopProgressBar();
    });
  } else {
    $scope.brand = { id: 'NEW', name: {}, data: {} };
    initFields();
  }
  $scope.save = () => {
    boUtils.startProgressBar();
    convertUtil.copyFieldObj($scope.brandFields1, $scope.brand);
    convertUtil.copyFieldObj($scope.brandFields2, $scope.brand);
    $rootScope.state.locales.forEach((locale) => {
      $scope.brand.name[locale] = $scope.brand.name.ko;
    });
    if ($scope.buildingMap && $scope.buildingMap[$scope.buildingId]) {
      _.set($scope.brand, 'data.location.building', _.pick($scope.buildingMap[$scope.buildingId], ['id', 'name']));
    }
    const requestBrand = _.pick($scope.brand, 'name', 'data');
    let promise;
    if ($state.params.brandId) {
      promise = $http.put(`/api/v1/brands/${$scope.brand.id}`, requestBrand);
    } else {
      // create brand
      promise = $http.post('/api/v1/brands', requestBrand);
    }
    promise.then((res) => {
      boUtils.stopProgressBar();
      return $http.put(`/api/v1/brands/${res.data.id}/index`);
    }, () => {
      window.alert('failed to save brand');
      boUtils.stopProgressBar();
    }).then(() => {
      boUtils.startProgressBar();
      setTimeout(() => {
        boUtils.stopProgressBar();
        $state.go('brand.main');
      }, 1000);
    });
  };

  $scope.removeAlias = (idx) => {
    $scope.brand.data.alias.splice(idx, 1);
  };
  $scope.onAliasInput = (e) => {
    const keyCode = e.keyCode;
    if (keyCode === 13 || keyCode === 32) {
      // Enter
      e.preventDefault();
      const newAlias = e.target.value;
      for (let i = 0; i < ($scope.brand.data.alias || []).length; i++) {
        if ($scope.brand.data.alias[i] === newAlias) {
          return;
        }
      }
      if (!$scope.brand.data.alias) {
        $scope.brand.data.alias = [];
      }
      $scope.brand.data.alias.push(newAlias);
      $(e.target).val('');
    }
  };
});
