// Copyright (C) 2016 Goom Inc. All rights reserved.

const buildingModule = angular.module('backoffice.building', [
  'ui.router',
  require('../utils/module').name,
  require('../third_party/angular-translate'),
]);

buildingModule.config(($translateProvider) => {
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

buildingModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';
  $stateProvider
    .state('building', {
      url: '/building',
      abstract: 'true',
      template: '<ui-view/>',
    })
    .state('building.main', {
      url: '/main',
      templateUrl: templateRoot + '/building/main.html',
      controller: 'BuildingMainController',
    })
    .state('building.info', {
      url: '/info/:buildingId',
      templateUrl: templateRoot + '/building/info.html',
      controller: 'BuildingInfoController',
    });
});

module.exports = buildingModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
