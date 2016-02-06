// Copyright (C) 2016 Goom Inc. All rights reserved.

const brandModule = angular.module('backoffice.brand', [
  'ui.router',
  require('../utils/module').name,
  require('../third_party/angular-translate'),
]);

brandModule.config(($translateProvider) => {
  $translateProvider
    .registerAvailableLanguageKeys(['en', 'ko'], {
      'en_US': 'en',
      'en_UK': 'en',
      'ko_KR': 'ko',
    })
    .determinePreferredLanguage();

  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
});

brandModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';
  $stateProvider
    .state('brand', {
      url: '/brand',
      abstract: 'true',
      template: '<ui-view/>',
    })
    .state('brand.main', {
      url: '/main',
      templateUrl: templateRoot + '/brand/main.html',
      controller: 'BrandMainController',
    });
});

module.exports = brandModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
