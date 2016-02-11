// Copyright (C) 2016 Goom Inc. All rights reserved.

const currencyModule = angular.module('backoffice.currency', [
  'ui.router',
  require('../third_party/angular-translate'),
]);

currencyModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

currencyModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('currency', {
      abstract: true,
      url: '/currency',
      template: '<ui-view/>',
    })
    .state('currency.main', {
      url: '/main',
      templateUrl: templateRoot + '/currency/main.html',
      controller: 'CurrencyMainController',
    })
});

module.exports = currencyModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
