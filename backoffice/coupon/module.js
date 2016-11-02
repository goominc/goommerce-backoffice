// Copyright (C) 2016 Goom Inc. All rights reserved.

const couponModule = angular.module('backoffice.coupon', []);

module.exports = couponModule;

couponModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('coupon', {
      abstract: true,
      url: '/coupon',
      template: '<ui-view/>',
    })
    .state('coupon.main', {
      url: '/main',
      templateUrl: templateRoot + '/coupon/main.html',
      controller: 'CouponMainController',
    })
    .state('coupon.userCoupons', {
      url: '/userCoupons',
      templateUrl: templateRoot + '/coupon/user-coupons.html',
      controller: 'CouponUserCouponController',
    });
});

// BEGIN module require js
require('./controllers');
// END module require js
