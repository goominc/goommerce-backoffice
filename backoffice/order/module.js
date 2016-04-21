// Copyright (C) 2016 Goom Inc. All rights reserved.

const orderModule = angular.module('backoffice.order', [
  'ui.router',
  'ui.bootstrap',
  require('../third_party/angular-translate'),
]);

orderModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

orderModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('order', {
      url: '/order',
      abstract: true,
      template: '<ui-view/>',
    })
    .state('order.main', {
      url: '/main',
      templateUrl: templateRoot + '/order/main.html',
      controller: 'OrderMainController',
    })
    .state('order.beforePayment', {
      url: '/before_payment',
      templateUrl: templateRoot + '/order/step0-before-payment.html',
      controller: 'OrderListBeforePaymentController',
    })
    .state('order.uncle', {
      url: '/uncle',
      templateUrl: templateRoot + '/order/uncle.html',
      controller: 'OrderUncleController',
      resolve: {
        orderProducts: ($http, $rootScope, $stateParams) => {
          return $http.get('/api/v1/uncle/order_products').then((res) => {
            return res.data;
          });
        },
      },
    })
    .state('order.detail', {
      url: '/detail/:orderId',
      templateUrl: templateRoot + '/order/detail.html',
      controller: 'OrderDetailController',
      resolve: {
        order: ($http, $rootScope, $stateParams) => {
          return $http.get('/api/v1/orders/' + $stateParams.orderId).then((res) => {
            res.data.status = $rootScope.getContentsI18nText(`enum.order.status.${res.data.status}` || res.data.status);
            return res.data;
          });
        },
      },
    });
});

module.exports = orderModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
