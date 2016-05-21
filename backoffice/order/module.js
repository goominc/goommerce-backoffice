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
    .state('order.listBigBuyer', {
      url: 'listBigBuyer',
      templateUrl: templateRoot + '/order/listBigBuyer.html',
      controller: 'OrderListBigBuyerController',
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
    })
    .state('order.settlement', {
      url: '/settlement',
      templateUrl: templateRoot + '/order/settlement.html',
      controller: 'OrderSettlementController',
    })
    .state('order.vat', {
      url: '/vat/:month',
      templateUrl: templateRoot + '/order/vat.html',
      controller: 'OrderVatController',
    })
    .state('order.brandVat', {
      url: '/brandVat/:brandId/:month',
      templateUrl: templateRoot + '/order/brandVat.html',
      controller: 'OrderBrandVatController',
    })
    .state('order.cs', {
      url: '/cs',
      templateUrl: templateRoot + '/order/cs.html',
      controller: 'OrderCsController',
    })
    .state('order.godo', {
      url: '/godo',
      templateUrl: templateRoot + '/order/godo.html',
      controller: 'OrderGodoController',
    })
    .state('order.detail', {
      url: '/detail/:orderId',
      templateUrl: templateRoot + '/order/detail.html',
      controller: 'OrderDetailController',
      resolve: {
        order: ($http, $rootScope, $stateParams) => {
          return $http.get('/api/v1/orders/' + $stateParams.orderId).then((res) => {
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
