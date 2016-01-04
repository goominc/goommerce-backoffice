
const productModule = angular.module('backoffice.product', [
  'ui.router',
  require('../utils/module').name,
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
    .state('product.edit', {

    });
});

module.exports = productModule;

// BEGIN module require js
require('./controllers.js');
// END module require js