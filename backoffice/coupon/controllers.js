// Copyright (C) 2016 Goom Inc. All rights reserved.

const couponModule = require('./module');

couponModule.controller('CouponMainController', ($scope, $http, $state, $rootScope, $translate) => {
  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'coupon.main',
      name: $scope.name,
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.couponDatatables = {
    field: 'coupons',
    columns: [
      {
        data: 'id',
      },
    ],
  };

  const loadCoupons = () => {
    $http.get('/api/v1/coupons').then((res) => {
      console.log(res.data);
    });
  };
  const loadUserCoupons = () => {

  };
  loadCoupons();
});

couponModule.controller('CouponUserCouponController', ($scope) => {

});
