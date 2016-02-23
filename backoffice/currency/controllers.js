// Copyright (C) 2016 Goom Inc. All rights reserved.

const currencyModule = require('./module');

currencyModule.controller('CurrencyMainController', ($scope, $http) => {
  $scope.rates = {
    USD: 0,
    CNY: 0,
  };
  $http.get('/api/v1/currency').then((res) => {
    if (res.data.USD) {
      $scope.rates.USD = res.data.USD;
    }
    if (res.data.CNY) {
      $scope.rates.CNY = res.data.CNY;
    }
  });
  $scope.save = () => {
    $http.post('/api/v1/currency', $scope.rates).then(() => {}).catch((res) => {
      window.alert(res);
      console.log(res);
    });
  };
});
