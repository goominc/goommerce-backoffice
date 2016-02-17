// Copyright (C) 2016 Goom Inc. All rights reserved.

const textModule = angular.module('backoffice.text', [
  'ui.router',
  require('../third_party/angular-translate'),
]);

textModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

textModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('text', {
      abstract: true,
      url: '/text',
      template: '<ui-view/>',
    })
    .state('text.main', {
      url:'/main',
      templateUrl: templateRoot + '/text/main.html',
      controller: 'TextMainController',
    });
});

module.exports = textModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
