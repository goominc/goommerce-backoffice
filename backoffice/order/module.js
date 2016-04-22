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
    .state('order.cs', {
      url: '/cs',
      templateUrl: templateRoot + '/order/cs.html',
      controller: 'OrderCsController',
      resolve: {
        orderProducts: ($http, $rootScope, $stateParams) => {
          const result = [];
          const limit = 1000;
          function recursive(offset) {
            return $http.get(`/api/v1/order_products?status=100:400&sorts=-orderId,-id&limit=${limit}&offset=${offset}`).then((res) => {
              const { pagination } = res.data;
              Array.prototype.push.apply(result, res.data.orderProducts);
              if (pagination.offset + pagination.limit < pagination.total) {
                return recursive(pagination.offset + pagination.limit);
              }
              console.log(result);
              return result;
            });
          }
          return recursive(0).then((res) => {
            return res;
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
