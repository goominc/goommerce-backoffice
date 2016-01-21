
const productModule = angular.module('backoffice.product', [
  'ui.router',
  'ui.bootstrap',
  require('../third_party/angular-translate'),
]);

productModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

productModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('product', {
      abstract: true,
      url: '/product',
      template: '<ui-view/>',
    })
    .state('product.main', {
      url: '/main',
      templateUrl: templateRoot + '/product/main.html',
      controller: 'ProductMainController',
    })
    .state('product.add', {
      url: '/add',
      templateUrl: templateRoot + '/product/edit.html',
      controller: 'ProductEditController',
      resolve: {
        product: () => { return { name: {}, price: {} }; },
        categories: ($http) => {
          return $http.get('/api/v1/categories').then((res) => {
            return res.data;
          });
        },
      },
    })
    .state('product.edit', {
      url: '/edit/:productId',
      templateUrl: templateRoot + '/product/edit.html',
      controller: 'ProductEditController',
      resolve: {
        product: ($http, $stateParams) => {
          return $http.get('/api/v1/products/' + $stateParams.productId).then((res) => {
            return res.data;
          });
        },
        categories: ($http) => {
          return $http.get('/api/v1/categories').then((res) => {
            return res.data;
          });
        },
      },
    })
    .state('product.category', {
      url: '/category',
      templateUrl: templateRoot + '/product/category.html',
      controller: 'CategoryEditController',
      resolve: {
        categories: ($http) => {
          return $http.get('/api/v1/categories').then((res) => {
            return res.data;
          });
        },
      },
    })
    .state('product.category.child', {
      url: '/:categoryId',
    });
});

module.exports = productModule;

// BEGIN module require js
require('./controllers.js');
// END module require js